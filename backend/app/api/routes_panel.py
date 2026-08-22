from fastapi import APIRouter

from app.core.db import FEEDBACK
from app.models.pydantic_schemas import FeedbackRequest

router = APIRouter()


@router.get("/today")
def today(panelist_id: str = "p1"):
	return {"success": True, "panelist_name": "Technical Panel A", "interviews": [{"id": "int_001", "time": "09:00", "candidate": {"id": "c1", "name": "Aarav Mehta", "cgpa": 8.7, "branch": "CSE", "skills": ["Python", "React", "SQL", "Git"], "projects": ["Smart Traffic Management System"]}, "company": "TechNova Solutions", "room": "Room 101", "round": "Technical Round 1", "status": "pending"}, {"id": "int_002", "time": "10:00", "candidate": {"id": "c2", "name": "Ananya Sharma", "cgpa": 9.1, "branch": "CSE", "skills": ["Python", "SQL", "Git"], "projects": ["Data Analytics Dashboard"]}, "company": "TechNova Solutions", "room": "Room 101", "round": "Technical Round 1", "status": "pending"}]}


@router.post("/feedback")
def feedback(request: FeedbackRequest):
	FEEDBACK.append(request.model_dump())
	return {"success": True, "message": "Feedback submitted successfully."}
