from fastapi import APIRouter
from pydantic import BaseModel
from fastapi import HTTPException
from uuid import UUID

from app.core.db import supabase
from app.agents.eligibility_agent import check_student_eligibility
from app.agents.match_agent import calculate_match
from app.agents.schedule_agent import generate_schedule
from app.agents.exception_recovery_agent import approve_recovery, simulate_room_delay
from app.agents.jd_agent import analyze_jd_with_gemini

router = APIRouter(prefix="/api/admin", tags=["Admin"])


class JDRequest(BaseModel):
    text: str


@router.post("/jd/analyze")
def analyze_jd(data: JDRequest):
    try:
        extracted = analyze_jd_with_gemini(data.text)
    except RuntimeError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
    except Exception as error:
        raise HTTPException(status_code=502, detail="Gemini JD extraction failed") from error
    return {"success": True, "agent": "JD Analyzer Agent", **extracted.model_dump(), "raw_text": data.text}

class EligibilityRequest(BaseModel):
    job_id: UUID


@router.post("/eligibility/run")
def run_eligibility(data: EligibilityRequest):

    # Get the selected job from Supabase
    job_response = (
        supabase
        .table("jobs")
        .select("*")
        .eq("id", str(data.job_id))
        .single()
        .execute()
    )

    job = job_response.data

    if not job:
        return {
            "success": False,
            "message": "Job not found"
        }

    # Get all students
    students_response = (
        supabase
        .table("students")
        .select("*")
        .execute()
    )

    students = students_response.data or []

    results = []

    # Check every student against the job requirements
    for student in students:

        result = check_student_eligibility(student, job)

        results.append(result)

        # Update the student's application
        (
            supabase
            .table("applications")
            .update({
                "eligibility_status": result["status"],
                "status": result["status"]
            })
            .eq("student_id", student["id"])
            .eq("job_id", str(data.job_id))
            .execute()
        )

    eligible_count = sum(
        1 for result in results
        if result["eligible"]
    )

    return {
        "success": True,
        "agent": "Eligibility Agent",
        "job_id": str(data.job_id),
        "job": job["role"],
        "total_students": len(results),
        "eligible_students": eligible_count,
        "ineligible_students": len(results) - eligible_count,
        "results": results
    }

class MatchRequest(BaseModel):
    job_id: UUID


class ScheduleRequest(BaseModel):
    job_id: UUID


class DelayRequest(BaseModel):
    room_id: UUID
    delay_minutes: int


class RecoveryApprovalRequest(BaseModel):
    proposed_changes: list[dict]

class ShortlistApprovalRequest(BaseModel):
    application_id: UUID
    decision: str
    reason: str | None = None    

@router.post("/shortlist/approve")
def approve_shortlist(data: ShortlistApprovalRequest):

    # Get the application
    application_response = (
        supabase
        .table("applications")
        .select("*")
        .eq("id", str(data.application_id))
        .single()
        .execute()
    )

    application = application_response.data

    if not application:
        return {
            "success": False,
            "message": "Application not found"
        }

    # Validate decision
    if data.decision not in ["approve", "reject"]:
        return {
            "success": False,
            "message": "Decision must be approve or reject"
        }

    # Update application status
    new_status = (
        "shortlisted"
        if data.decision == "approve"
        else "rejected"
    )

    (
        supabase
        .table("applications")
        .update({
            "status": new_status
        })
        .eq("id", str(data.application_id))
        .execute()
    )

    # Store human approval decision
    approval_response = (
        supabase
        .table("approvals")
        .insert({
            "action_type": "shortlist",
            "reference_id": str(data.application_id),
            "status": "approved" if data.decision == "approve" else "rejected",
            "reason": data.reason
        })
        .execute()
    )

    return {
        "success": True,
        "message": "Shortlist decision recorded",
        "application_id": str(data.application_id),
        "decision": data.decision,
        "status": new_status,
        "reason": data.reason
    }    


@router.post("/schedule/generate")
def create_schedule(data: ScheduleRequest):
    return generate_schedule(supabase, str(data.job_id))


@router.post("/simulate-delay")
def simulate_delay(data: DelayRequest):
    if data.delay_minutes <= 0:
        return {"success": False, "message": "delay_minutes must be greater than zero"}
    return simulate_room_delay(supabase, str(data.room_id), data.delay_minutes)


@router.post("/simulate-delay/approve")
def approve_delay_recovery(data: RecoveryApprovalRequest):
    return approve_recovery(supabase, data.proposed_changes)


@router.post("/matches/generate")
def generate_matches(data: MatchRequest):

    # Get the selected job
    job_response = (
        supabase
        .table("jobs")
        .select("*")
        .eq("id", str(data.job_id))
        .single()
        .execute()
    )

    job = job_response.data

    if not job:
        return {
            "success": False,
            "message": "Job not found"
        }

    # Get job skills
    job_skills_response = (
        supabase
        .table("job_skills")
        .select("*")
        .eq("job_id", str(data.job_id))
        .execute()
    )

    job_skills = job_skills_response.data or []

    # Get all students
    students_response = (
        supabase
        .table("students")
        .select("*")
        .execute()
    )

    students = students_response.data or []

    applications = []

    # Create/update an application for every eligible student
    for student in students:

        eligibility = check_student_eligibility(
            student,
            job
        )

        if not eligibility["eligible"]:
            continue

        application_response = (
            supabase
            .table("applications")
            .upsert(
                {
                    "student_id": student["id"],
                    "job_id": str(data.job_id),
                    "eligibility_status": "eligible",
                    "status": "eligible"
                },
                on_conflict="student_id,job_id"
            )
            .execute()
        )

        if application_response.data:
            applications.append(
                application_response.data[0]
            )

    results = []

    # Match every eligible student
    for application in applications:

        student_id = application["student_id"]

        # Get student skills
        skills_response = (
            supabase
            .table("student_skills")
            .select("*")
            .eq("student_id", student_id)
            .execute()
        )

        student_skills = skills_response.data or []

        # Calculate match
        match = calculate_match(
            student_skills,
            job_skills
        )

        # Update application with match result
        (
            supabase
            .table("applications")
            .update({
                "match_score": match["match_score"],
                "match_explanation": match["match_explanation"]
            })
            .eq("id", application["id"])
            .execute()
        )

        # Store missing skills
        for skill in match["missing_skills"]:

            (
                supabase
                .table("skill_gaps")
                .insert({
                    "student_id": student_id,
                    "job_id": str(data.job_id),
                    "skill_name": skill,
                    "gap_type": "missing"
                })
                .execute()
            )

        results.append({
            "student_id": student_id,
            "match_score": match["match_score"],
            "matched_skills": match["matched_skills"],
            "missing_skills": match["missing_skills"],
            "explanation": match["match_explanation"],
            "confidence": match["confidence"]
        })

    # Sort highest match first
    results.sort(
        key=lambda x: x["match_score"],
        reverse=True
    )

    return {
        "success": True,
        "agent": "Matchmaker Agent",
        "job_id": str(data.job_id),
        "job": job["role"],
        "candidates_analyzed": len(results),
        "matches": results
    }