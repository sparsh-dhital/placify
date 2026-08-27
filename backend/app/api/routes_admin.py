from fastapi import APIRouter, HTTPException, Depends
from app.agents.jd_agent import analyze_job_description
from app.agents.match_agent import match_candidates
from app.agents.schedule_agent import generate_schedule
from database import db
from app.models.pydantic_schemas import JDAnalyzeRequest, JobRequest, ShortlistRequest
from app.core.security import get_current_admin

router = APIRouter()

@router.post("/jd/analyze")
async def analyze_jd(request: JDAnalyzeRequest, admin: dict = Depends(get_current_admin)):
    return analyze_job_description(request.text)

async def _get_job(job_id: str):
    job = await db.db["jobs"].find_one({"id": job_id})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found in MongoDB")
    return job

@router.post("/eligibility/run")
async def run_eligibility(request: JobRequest, admin: dict = Depends(get_current_admin)):
    job = await _get_job(request.job_id)
    students = await db.db["students"].find({}).to_list(length=1000)
    
    results = []
    for student in students:
        reasons = []
        if student.get("cgpa", 0) < job.get("min_cgpa", 0): 
            reasons.append(f"CGPA: {student.get('cgpa')} (Required: {job.get('min_cgpa')})")
        if student.get("backlogs", 0) > job.get("max_backlogs", 0): 
            reasons.append(f"Backlogs: {student.get('backlogs')} (Allowed: {job.get('max_backlogs')})")
        
        results.append({
            "student_id": student.get("student_id"), 
            "student_name": student.get("name"), 
            "cgpa": student.get("cgpa"), 
            "backlogs": student.get("backlogs"), 
            "eligible": not reasons, 
            "status": "Eligible" if not reasons else "Ineligible", 
            "reasons": reasons
        })
        
    eligible = sum(1 for item in results if item["eligible"])
    return {
        "success": True, "agent": "Eligibility Agent", "job_id": request.job_id, 
        "job": job.get("role"), "company": job.get("company"), 
        "total_students": len(results), "eligible_students": eligible, 
        "ineligible_students": len(results) - eligible, "results": results
    }

@router.post("/matches/generate")
async def generate_matches(request: JobRequest, admin: dict = Depends(get_current_admin)):
    job = await _get_job(request.job_id)
    # Pull eligible students only for matching
    students = await db.db["students"].find({"cgpa": {"$gte": job.get("min_cgpa", 0)}}).to_list(length=100)
    return match_candidates(job, students)

@router.post("/shortlist/approve")
async def approve_shortlist(request: ShortlistRequest, admin: dict = Depends(get_current_admin)):
    approved = 0
    for decision in request.decisions:
        if decision.action == "approve":
            approved += 1
        # Update the student's status in MongoDB
        await db.db["students"].update_one(
            {"student_id": decision.student_id},
            {"$set": {"shortlist_status": decision.action}}
        )
        
    return {
        "success": True, 
        "message": "Shortlist saved to MongoDB. Ready for scheduling.", 
        "approved_count": approved, 
        "rejected_count": len(request.decisions) - approved
    }

@router.post("/schedule/generate")
async def create_schedule(request: JobRequest, admin: dict = Depends(get_current_admin)):
    job = await _get_job(request.job_id)
    approved_students = await db.db["students"].find({"shortlist_status": "approve"}).to_list(length=100)
    panels = await db.db["panels"].find({}).to_list(length=20)
    rooms = await db.db["rooms"].find({}).to_list(length=20)
    
    if not approved_students:
        raise HTTPException(status_code=400, detail="No approved students found for scheduling.")
        
    schedule = generate_schedule(approved_students, panels, rooms)
    if schedule.get("success"):
        await db.db["interviews"].insert_many(schedule["schedule"])
        
    return schedule