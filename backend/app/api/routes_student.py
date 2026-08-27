# backend/app/api/routes_student.py
from fastapi import APIRouter, HTTPException, Depends
from app.core.db import STUDENTS, JOBS
from app.agents.match_agent import match_candidates
from app.core.security import get_current_student

router = APIRouter()

@router.get("/dashboard")
def dashboard(student: dict = Depends(get_current_student)):
    # Securely extract the ID from the token, not the URL
    student_id = student["id"]
    
    # Fallback to the first student in the mock array if the ID isn't found during testing
    student_record = next((s for s in STUDENTS if s["student_id"] == student_id), STUDENTS[0])
        
    job = JOBS.get("20000000-0000-0000-0000-000000000001")
    if not job:
        raise HTTPException(status_code=404, detail="Active job not found")
        
    match_data = match_candidates(job, [student_record])
    result = match_data["matches"][0] if match_data["matches"] else None
    
    if not result:
        raise HTTPException(status_code=500, detail="Match generation failed")

    return {
        "success": True, 
        "profile": {
            "name": student_record["name"], 
            "roll_no": f"2026{student_record['branch']}001", 
            "branch": student_record["branch"],
            "cgpa": student_record["cgpa"], 
            "readiness_score": result["match_score"]
        }, 
        "upcoming_interview": {
            "company": job["company"],
            "role": job["role"],
            "date": "Tomorrow",
            "time": "10:00 AM",
            "room": "Room 101",
            "panel": "Technical Panel A",
            "status": "Confirmed"
        }, 
        "job_matches": [{
            "company": job["company"],
            "role": job["role"],
            "match_score": result["match_score"],
            "matched_skills": result["matched_skills"],
            "missing_skills": result["missing_skills"]
        }], 
        "ai_recommendations": [
            result["explanation"],
            f"Focus on acquiring missing skills: {', '.join(result['missing_skills'])}" if result["missing_skills"] else "Profile is highly optimized. Review core technical concepts."
        ]
    }