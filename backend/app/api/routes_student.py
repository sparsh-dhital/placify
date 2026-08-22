from fastapi import APIRouter

router = APIRouter()


@router.get("/dashboard")
def dashboard(student_id: str = "s1"):
	return {"success": True, "profile": {"name": "Aarav Mehta", "roll_no": "23CSE001", "branch": "CSE", "cgpa": 8.7, "readiness_score": 87}, "upcoming_interview": {"company": "TechNova Solutions", "role": "Software Engineer", "date": "Tomorrow", "time": "10:00 AM", "room": "Room 101", "panel": "Technical Panel A", "status": "Confirmed"}, "job_matches": [{"company": "TechNova Solutions", "role": "Software Engineer", "match_score": 92, "matched_skills": ["Python", "SQL", "Git", "React"], "missing_skills": ["Docker"]}], "ai_recommendations": ["Learn Docker basics to improve TechNova match.", "Practice advanced SQL queries.", "Complete 1 backend project.", "Run a mock technical interview."]}
