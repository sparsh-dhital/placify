from fastapi import APIRouter, Depends, HTTPException
from database import db
from app.models.pydantic_schemas import FeedbackRequest
from app.core.security import get_current_panelist
from bson import ObjectId

router = APIRouter()

@router.get("/today")
async def today(panelist: dict = Depends(get_current_panelist)):
    panelist_id = panelist["id"]
    panel_record = await db.db["panels"].find_one({"panel_id": panelist_id})
    panel_name = panel_record["name"] if panel_record else f"Panel {panelist_id}"
    
    interviews = await db.db["interviews"].find({"panel": panel_name}).to_list(length=50)
    formatted_interviews = []
    
    for inv in interviews:
        student_name = inv.get("student")
        student = await db.db["students"].find_one({"name": student_name}) if student_name else None
        
        formatted_interviews.append({
            "id": str(inv.get("id", inv.get("_id"))), 
            "time": inv.get("start_time"), 
            "status": inv.get("status", "pending"), 
            "room": inv.get("room"), 
            "round": "Technical Round 1", 
            "company": inv.get("company", "TechNova Solutions"), 
            "candidate": {
                "id": student.get("student_id") if student else "unknown", 
                "name": student_name or "Unknown Student", 
                "cgpa": student.get("cgpa", 0.0) if student else 0.0, 
                "branch": student.get("branch", "CSE") if student else "CSE", 
                "skills": student.get("skills", []) if student else [], 
                "projects": student.get("projects", []) if student else []
            }
        })
        
    return {
        "success": True, 
        "panelist_name": panel_name, 
        "interviews": formatted_interviews
    }

@router.post("/feedback")
async def feedback(request: FeedbackRequest, panelist: dict = Depends(get_current_panelist)):
    await db.db["feedback"].insert_one(request.model_dump())
    
    result = await db.db["interviews"].update_one(
        {"id": request.interview_id}, 
        {"$set": {"status": "completed"}}
    )
    
    if result.matched_count == 0:
        try:
            await db.db["interviews"].update_one(
                {"_id": ObjectId(request.interview_id)}, 
                {"$set": {"status": "completed"}}
            )
        except Exception:
            pass
    
    return {"success": True, "message": "Feedback securely saved to MongoDB."}