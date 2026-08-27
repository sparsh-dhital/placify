# backend/app/api/routes_panel.py
from fastapi import APIRouter, Depends
from app.core.db import FEEDBACK
from app.models.pydantic_schemas import FeedbackRequest
from app.core.security import get_current_panelist

router = APIRouter()

@router.get("/today")
def today(panelist: dict = Depends(get_current_panelist)):
    return {
        "success": True, 
        "panelist_name": "Technical Panel A", 
        "interviews": [
            {
                "id": "int_001", "time": "09:00", "status": "pending", "room": "Room 101", "round": "Technical Round 1", "company": "TechNova Solutions",
                "candidate": {"id": "c1", "name": "Aarav Mehta", "cgpa": 8.7, "branch": "CSE", "skills": ["Python", "React", "SQL", "Git"], "projects": ["Smart Traffic Management System"]}
            }, 
            {
                "id": "int_002", "time": "10:00", "status": "pending", "room": "Room 101", "round": "Technical Round 1", "company": "TechNova Solutions",
                "candidate": {"id": "c2", "name": "Ananya Sharma", "cgpa": 9.1, "branch": "CSE", "skills": ["Python", "SQL", "Git"], "projects": ["Data Analytics Dashboard"]}
            }
        ]
    }

@router.post("/feedback")
def feedback(request: FeedbackRequest, panelist: dict = Depends(get_current_panelist)):
    FEEDBACK.append(request.model_dump())
    return {"success": True, "message": "Feedback submitted successfully."}