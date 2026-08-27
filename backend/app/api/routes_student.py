# backend/app/api/routes_student.py
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from database import db
from app.agents.match_agent import match_candidates
from app.core.security import get_current_student

router = APIRouter()

class ResumeSyncPayload(BaseModel):
    cgpa: float | None = None
    skills: list[str] = []
    readiness_score: int = 0

@router.get("/dashboard")
async def dashboard(student: dict = Depends(get_current_student)):
    student_id = student["id"]
    
    # Normal Flow: Fetch from MongoDB
    student_record = await db.db["students"].find_one({"student_id": student_id})
    
    # Edge Case: Profile missing? Auto-recover using verified JWT Auth data
    if not student_record:
        student_record = {
            "student_id": student_id,
            "name": student.get("name"),   # Exact name from login payload
            "email": student.get("email"), # Exact email from login payload
            "branch": "CSE",
            "cgpa": 0.0,
            "skills": [],
            "shortlist_status": "pending"
        }
        await db.db["students"].insert_one(student_record)
        
    job = await db.db["jobs"].find_one({"status": "active"})
    if not job:
        return {
            "success": True, 
            "profile": {
                "name": student_record.get("name", "Student"), 
                "roll_no": f"2026{student_record.get('branch', 'CSE')}001", 
                "branch": student_record.get("branch", "CSE"),
                "cgpa": student_record.get("cgpa", 0.0), 
                "readiness_score": 0
            }, 
            "upcoming_interview": None, 
            "job_matches": [], 
            "ai_recommendations": ["No active recruitment drives found in the database.", "Keep your skills updated!"]
        }
        
    match_data = match_candidates(job, [student_record])
    result = match_data["matches"][0] if match_data.get("matches") else {
        "match_score": 0, "matched_skills": [], "missing_skills": [], "explanation": "Profile evaluation pending."
    }
        
    upcoming = await db.db["interviews"].find_one({"student_id": student_id, "status": "proposed"})

    return {
        "success": True, 
        "profile": {
            "name": student_record.get("name", "Student"), 
            "roll_no": f"2026{student_record.get('branch', 'CSE')}001", 
            "branch": student_record.get("branch", "CSE"),
            "cgpa": student_record.get("cgpa", 0.0), 
            "readiness_score": result.get("match_score", 0)
        }, 
        "upcoming_interview": {
            "company": job.get("company", "Unknown"),
            "role": job.get("role", "Role"),
            "date": upcoming.get("start_time", "TBD").split("T")[0] if upcoming else "TBD",
            "time": upcoming.get("start_time", "TBD").split("T")[-1] if upcoming else "TBD",
            "room": upcoming.get("room", "TBD") if upcoming else "TBD",
            "panel": upcoming.get("panel", "TBD") if upcoming else "TBD",
            "status": "Confirmed" if upcoming else "Pending"
        } if upcoming else None, 
        "job_matches": [{
            "company": job.get("company"),
            "role": job.get("role"),
            "match_score": result.get("match_score", 0),
            "matched_skills": result.get("matched_skills", []),
            "missing_skills": result.get("missing_skills", [])
        }], 
        "ai_recommendations": [
            result.get("explanation", ""),
            f"Focus on acquiring missing skills: {', '.join(result.get('missing_skills', []))}" if result.get("missing_skills") else "Profile is highly optimized."
        ]
    }

@router.post("/sync-resume")
async def sync_resume_data(payload: ResumeSyncPayload, student: dict = Depends(get_current_student)):
    student_id = student["id"]
    
    update_data = {
        "skills": payload.skills,
    }
    if payload.cgpa is not None:
        update_data["cgpa"] = payload.cgpa

    await db.db["students"].update_one(
        {"student_id": student_id},
        {"$set": update_data},
        upsert=True
    )
    
    return {
        "success": True, 
        "message": "Resume data permanently synced to MongoDB profile!"
    }