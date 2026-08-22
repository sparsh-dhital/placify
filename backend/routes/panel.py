# backend/routes/panel.py
from fastapi import APIRouter
from pydantic import BaseModel
from database import db

router = APIRouter()

class FeedbackPayload(BaseModel):
    interview_id: str
    technical_score: int
    communication_score: int
    problem_solving_score: int
    overall_result: str
    comments: str

@router.post("/feedback")
async def submit_feedback(payload: FeedbackPayload):
    # Save the panelist's evaluation to MongoDB
    feedback_data = payload.dict()
    await db.feedbacks.insert_one(feedback_data)
    
    return {"success": True, "message": "Feedback submitted successfully."}