from fastapi import APIRouter, HTTPException

from app.agents.jd_agent import analyze_job_description
from app.agents.match_agent import match_candidates
from app.agents.schedule_agent import generate_schedule
from app.core.db import JOBS, PANELS, ROOMS, STUDENTS
from app.models.pydantic_schemas import JDAnalyzeRequest, JobRequest, ShortlistRequest

router = APIRouter()


@router.post("/jd/analyze")
def analyze_jd(request: JDAnalyzeRequest):
	return analyze_job_description(request.text)


def _job(job_id: str):
	if job_id not in JOBS:
		raise HTTPException(status_code=404, detail="Job not found")
	return JOBS[job_id]


@router.post("/eligibility/run")
def run_eligibility(request: JobRequest):
	job = _job(request.job_id)
	results = []
	for student in STUDENTS:
		reasons = []
		if student["cgpa"] < job["min_cgpa"]: reasons.append(f"CGPA: {student['cgpa']} (Required: {job['min_cgpa']})")
		if student["backlogs"] > job["max_backlogs"]: reasons.append(f"Backlogs: {student['backlogs']} (Allowed: {job['max_backlogs']})")
		results.append({"student_id": student["student_id"], "student_name": student["name"], "cgpa": student["cgpa"], "backlogs": student["backlogs"], "eligible": not reasons, "status": "Eligible" if not reasons else "Ineligible", "reasons": reasons})
	eligible = sum(item["eligible"] for item in results)
	return {"success": True, "agent": "Eligibility Agent", "job_id": request.job_id, "job": job["role"], "company": job["company"], "total_students": len(results), "eligible_students": eligible, "ineligible_students": len(results) - eligible, "results": results}


@router.post("/matches/generate")
def generate_matches(request: JobRequest):
	return match_candidates(_job(request.job_id), STUDENTS[:2])


@router.post("/shortlist/approve")
def approve_shortlist(request: ShortlistRequest):
	approved = sum(item.get("action") == "approve" for item in request.decisions)
	return {"success": True, "message": "Shortlist saved. Ready for scheduling.", "approved_count": approved, "rejected_count": len(request.decisions) - approved}


@router.post("/schedule/generate")
def create_schedule(request: JobRequest):
	_job(request.job_id)
	return generate_schedule(STUDENTS[:3], PANELS, ROOMS)
