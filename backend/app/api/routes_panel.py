from fastapi import APIRouter, Depends, HTTPException
from database import db
from app.models.pydantic_schemas import FeedbackRequest
from app.core.security import get_current_panelist

router = APIRouter()

@router.get("/today")
async def today(panelist: dict = Depends(get_current_panelist)):
    panelist_id = panelist["id"]
    panel_record = await db.db["panels"].find_one({"panel_id": panelist_id})
    panel_name = panel_record["name"] if panel_record else f"Panel {panelist_id}"
    
    interviews = await db.db["interviews"].find({"panel": panel_name}).to_list(length=50)
    formatted_interviews = []
    
    for inv in interviews:
        student = await db.db["students"].find_one({"student_id": inv.get("student_id")})
        if not student:
            continue
            
        formatted_interviews.append({
            "id": str(inv.get("_id", inv.get("id"))), 
            "time": inv.get("start_time"), 
            "status": inv.get("status", "pending"), 
            "room": inv.get("room"), 
            "round": "Technical Round 1", 
            "company": "TechNova Solutions", 
            "candidate": {
                "id": student.get("student_id"), 
                "name": student.get("name"), 
                "cgpa": student.get("cgpa"), 
                "branch": student.get("branch"), 
                "skills": student.get("skills", []), 
                "projects": student.get("projects", [])
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
    
    await db.db["interviews"].update_one(
        {"_id": request.interview_id}, 
        {"$set": {"status": "completed"}}
    )
    
    return {"success": True, "message": "Feedback securely saved to MongoDB."}