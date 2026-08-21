import logging

from fastapi import APIRouter, HTTPException

from app.agents.eligibility_agent import evaluate_student
from app.agents.jd_agent import analyze_jd
from app.agents.match_agent import match_student
from app.agents.schedule_agent import build_schedule
from app.core.db import get_supabase, one, rows
from app.models.pydantic_schemas import EligibilityRequest, EligibilityResponse, JDAnalyzeRequest, JobCreateRequest, JDAnalysisResponse, JobRequest, ShortlistRequest

router = APIRouter(prefix="/api/admin", tags=["admin"])
logger = logging.getLogger(__name__)


@router.post("/jd/analyze", response_model=JDAnalysisResponse)
async def analyze_job_description(payload: JDAnalyzeRequest):
    try:
        return analyze_jd(payload.text, payload.company, payload.role)
    except ValueError as exc:
        raise HTTPException(422, str(exc)) from exc


@router.post("/jobs/create", response_model=JDAnalysisResponse, status_code=201)
async def create_job(payload: JobCreateRequest):
    analysis = analyze_jd(payload.description, payload.company, payload.role)
    if payload.min_cgpa is not None:
        analysis.min_cgpa = payload.min_cgpa
    if payload.max_backlogs is not None:
        analysis.max_backlogs = payload.max_backlogs
    if payload.eligible_branches:
        analysis.eligible_branches = payload.eligible_branches
    client = get_supabase()
    try:
        values = {"company_name": analysis.company, "role": analysis.role, "description": payload.description, "location": payload.location, "salary": payload.salary, "min_cgpa": analysis.min_cgpa, "max_backlogs": analysis.max_backlogs, "allowed_branches": analysis.eligible_branches, "status": "open"}
        try:
            job = one(client.table("jobs").insert(values).execute())
        except Exception as exc:
            if "column" not in str(exc) or "does not exist" not in str(exc):
                raise
            job = one(client.table("jobs").insert({"company": analysis.company, "role": payload.role or analysis.role, "description": payload.description, "location": payload.location, "salary": payload.salary, "min_cgpa": analysis.min_cgpa, "max_backlogs": analysis.max_backlogs, "eligible_branches": analysis.eligible_branches, "status": "draft"}).execute())
        if not job:
            raise HTTPException(502, "Supabase did not return the created job")
        skills = [{"job_id": job["id"], "skill_name": skill, "skill_type": "mandatory"} for skill in analysis.required_skills] + [{"job_id": job["id"], "skill_name": skill, "skill_type": "preferred"} for skill in analysis.preferred_skills]
        if skills:
            client.table("job_skills").insert(skills).execute()
        analysis.job_id = str(job["id"])
        return analysis
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(502, "Supabase could not save the job") from exc


@router.post("/eligibility/run", response_model=EligibilityResponse)
async def run_eligibility(payload: EligibilityRequest):
    client = get_supabase()
    try:
        job = one(client.table("jobs").select("*").eq("id", payload.job_id).execute())
        if not job:
            raise HTTPException(404, "Job not found")
        job["required_skills"] = [item["skill_name"] for item in rows(client.table("job_skills").select("skill_name").eq("job_id", payload.job_id).eq("skill_type", "mandatory").execute())]
        job["eligible_branches"] = job.get("eligible_branches") or job.get("allowed_branches") or []
        students = rows(client.table("students").select("*").execute())
        skill_rows = rows(client.table("student_skills").select("student_id,skill_name").execute())
        skills_by_student: dict[str, set[str]] = {}
        for item in skill_rows:
            skills_by_student.setdefault(str(item["student_id"]), set()).add(item["skill_name"])
        results = [evaluate_student(student, job, skills_by_student.get(str(student["id"]), set())) for student in students]
        try:
            for result in results:
                client.table("eligibility_results").upsert({"job_id": payload.job_id, "student_id": result.student_id, "eligible": result.eligible, "reasons": result.reasons, "diagnostics": result.model_dump()}, on_conflict="job_id,student_id").execute()
        except Exception:
            pass
        return EligibilityResponse(job_id=payload.job_id, job=job.get("role", ""), company=job.get("company", job.get("company_name", "")), total_students=len(results), eligible_students=sum(item.eligible for item in results), ineligible_students=sum(not item.eligible for item in results), results=results)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(502, "Unable to run eligibility against Supabase") from exc


@router.get("/jobs/{job_id}/eligible-pool")
async def eligible_pool(job_id: str):
    client = get_supabase()
    try:
        results = rows(client.table("eligibility_results").select("student_id,students(*)").eq("job_id", job_id).eq("eligible", True).execute())
        return {"success": True, "job_id": job_id, "students": [item.get("students") for item in results], "count": len(results)}
    except Exception as exc:
        raise HTTPException(502, "Unable to load the eligible student pool") from exc


@router.post("/matches/generate")
async def generate_matches(payload: JobRequest):
    client = get_supabase()
    try:
        job = one(client.table("jobs").select("*").eq("id", payload.job_id).execute())
        if not job:
            raise HTTPException(404, "Job not found")
        job["required_skills"] = [item["skill_name"] for item in rows(client.table("job_skills").select("skill_name").eq("job_id", payload.job_id).eq("skill_type", "mandatory").execute())]
        job["preferred_skills"] = [item["skill_name"] for item in rows(client.table("job_skills").select("skill_name").eq("job_id", payload.job_id).eq("skill_type", "preferred").execute())]
        students = rows(client.table("students").select("*").execute())
        skill_rows = rows(client.table("student_skills").select("student_id,skill_name").execute())
        skills_by_student: dict[str, set[str]] = {}
        for item in skill_rows:
            skills_by_student.setdefault(str(item["student_id"]), set()).add(item["skill_name"])
        matches = [match_student(student, job, skills_by_student.get(str(student["id"]), set())) for student in students]
        return {"success": True, "agent": "Matchmaker Agent", "job_id": payload.job_id, "job": job.get("role", ""), "company": job.get("company", job.get("company_name", "")), "candidates_analyzed": len(matches), "matches": sorted(matches, key=lambda item: item["match_score"], reverse=True)}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(502, "Unable to generate matches") from exc


@router.post("/shortlist/approve")
async def approve_shortlist(payload: ShortlistRequest):
    client = get_supabase()
    try:
        if payload.decisions:
            client.table("shortlist_decisions").upsert([{"job_id": payload.job_id, **decision.model_dump()} for decision in payload.decisions], on_conflict="job_id,student_id").execute()
        approved = sum(decision.action == "approve" for decision in payload.decisions)
        return {"success": True, "message": "Shortlist decisions saved successfully.", "approved_count": approved, "rejected_count": len(payload.decisions) - approved}
    except Exception as exc:
        raise HTTPException(502, "Unable to save shortlist decisions") from exc


@router.post("/schedule/generate")
async def generate_schedule(payload: JobRequest):
    client = get_supabase()
    try:
        job = one(client.table("jobs").select("*").eq("id", payload.job_id).execute())
        if not job:
            raise HTTPException(404, "Job not found")
        job["required_skills"] = [item["skill_name"] for item in rows(client.table("job_skills").select("skill_name").eq("job_id", payload.job_id).eq("skill_type", "mandatory").execute())]
        try:
            approved = rows(client.table("shortlist_decisions").select("student_id").eq("job_id", payload.job_id).eq("action", "approve").execute())
        except Exception as exc:
            if "PGRST205" not in str(exc) or "shortlist_decisions" not in str(exc):
                raise
            approved = []
        if not approved:
            try:
                approved = rows(client.table("eligibility_results").select("student_id").eq("job_id", payload.job_id).eq("eligible", True).execute())
            except Exception as exc:
                if "PGRST205" not in str(exc) or "eligibility_results" not in str(exc):
                    raise
                students = rows(client.table("students").select("*").execute())
                skill_rows = rows(client.table("student_skills").select("student_id,skill_name").execute())
                skills_by_student: dict[str, set[str]] = {}
                for skill_row in skill_rows:
                    skills_by_student.setdefault(str(skill_row["student_id"]), set()).add(skill_row["skill_name"])
                approved = [{"student_id": result.student_id} for student in students if (result := evaluate_student(student, job, skills_by_student.get(str(student["id"]), set()))).eligible]
        existing = rows(client.table("interviews").select("student_id").eq("job_id", payload.job_id).in_("status", ["proposed", "confirmed"]).execute())
        existing_students = {str(item["student_id"]) for item in existing}
        existing_interviews = rows(client.table("interviews").select("student_id,start_time,end_time").eq("job_id", payload.job_id).in_("status", ["proposed", "confirmed"]).execute())
        plan = build_schedule([str(item["student_id"]) for item in approved if str(item["student_id"]) not in existing_students], existing_interviews)
        items = plan["schedule"]
        if items:
            try:
                inserted = rows(client.table("interviews").insert([{**item, "job_id": payload.job_id} for item in items]).execute())
            except Exception as exc:
                if "column" not in str(exc) or "room" not in str(exc):
                    raise
                without_rooms = [{key: value for key, value in item.items() if key != "room"} | {"job_id": payload.job_id} for item in items]
                inserted = rows(client.table("interviews").insert(without_rooms).execute())
            for item, saved in zip(items, inserted):
                item["id"] = str(saved["id"])
        return {"success": True, "agent": "Scheduler Agent", "conflict_detected": plan["conflict_detected"], "conflict_details": plan["conflict_details"], "schedule": items}
    except Exception as exc:
        logger.exception("Failed to generate schedule for job %s", payload.job_id)
        raise HTTPException(502, "Unable to generate interview schedule") from exc
