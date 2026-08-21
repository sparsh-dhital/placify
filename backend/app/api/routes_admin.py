from fastapi import APIRouter
from pydantic import BaseModel
from uuid import UUID
import re

from app.core.db import supabase
from app.agents.eligibility_agent import check_student_eligibility
from app.agents.match_agent import calculate_match

router = APIRouter(prefix="/api/admin", tags=["Admin"])


class JDRequest(BaseModel):
    text: str


@router.post("/jd/analyze")
def analyze_jd(data: JDRequest):

    text = data.text

    # Simple deterministic extraction for MVP
    cgpa_match = re.search(
        r"(?:minimum|min|at least)\s*(?:cgpa\s*)?(\d+(?:\.\d+)?)",
        text,
        re.IGNORECASE
    )

    backlog_match = re.search(
        r"(\d+)\s*(?:backlogs?|active backlogs?)",
        text,
        re.IGNORECASE
    )

    salary_match = re.search(
        r"(₹?\s*\d+(?:\.\d+)?\s*(?:LPA|lakhs?))",
        text,
        re.IGNORECASE
    )

    skills = [
        skill for skill in [
            "Python",
            "Java",
            "C++",
            "JavaScript",
            "React",
            "Node.js",
            "SQL",
            "PostgreSQL",
            "MongoDB",
            "Machine Learning",
            "Git",
            "Docker",
            "AWS",
            "Spring Boot"
        ]
        if skill.lower() in text.lower()
    ]

    return {
        "success": True,
        "agent": "JD Analyzer Agent",
        "company_name": "TechNova Solutions",
        "role": "Software Engineer",
        "min_cgpa": float(cgpa_match.group(1)) if cgpa_match else None,
        "max_backlogs": int(backlog_match.group(1)) if backlog_match else 0,
        "salary": salary_match.group(1) if salary_match else None,
        "required_skills": skills,
        "preferred_skills": [],
        "raw_text": text
    }

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

    # Get eligible applications
    applications_response = (
        supabase
        .table("applications")
        .select("*")
        .eq("job_id", str(data.job_id))
        .eq("eligibility_status", "eligible")
        .execute()
    )

    applications = applications_response.data or []

    results = []

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

