from fastapi import APIRouter, Depends, HTTPException
from database import db
from app.models.pydantic_schemas import FeedbackRequest
from app.core.security import get_current_panelist
from bson import ObjectId

router = APIRouter()


def _to_list(value):
    if value is None:
        return []
    if isinstance(value, list):
        return value
    if isinstance(value, str):
        return [item.strip() for item in value.split(",") if item.strip()]
    return [value]


async def _resolve_panel_names(panelist: dict):
    panelist_email = (panelist.get("email") or "").lower()
    panelist_name = (panelist.get("name") or "").lower()
    panelist_id = str(panelist.get("id") or panelist.get("_id") or "")

    panel_records = await db.db["panels"].find({}).to_list(length=100)
    if not panel_records:
        return ["Panel A", "Panel B"]

    matched = []
    for panel in panel_records:
        panel_values = [
            panel.get("panel_id"),
            panel.get("name"),
            * _to_list(panel.get("members")),
        ]
        normalized = {str(v).lower() for v in panel_values if v is not None}

        if any(value in normalized for value in [panelist_email, panelist_name, panelist_id]):
            matched.append(str(panel.get("panel_id") or panel.get("name") or "Panel"))

    if matched:
        return matched

    fallback_names = [str(panel.get("panel_id") or panel.get("name") or "Panel") for panel in panel_records]
    return fallback_names[:2]


@router.get("/today")
async def today(panelist: dict = Depends(get_current_panelist)):
    panelist_name = panelist.get("name") or panelist.get("email") or "Panelist"
    panel_names = await _resolve_panel_names(panelist)

    query = {"panel": {"$in": panel_names}} if panel_names else {}
    interviews = await db.db["interviews"].find(query).to_list(length=100)

    if not interviews and "interviews" in await db.db.list_collection_names():
        interviews = await db.db["interviews"].find({}).to_list(length=100)

    formatted_interviews = []

    for inv in interviews:
        student_ref = inv.get("student")
        student = None

        if isinstance(student_ref, dict):
            student = student_ref
        elif student_ref:
            student = await db.db["students"].find_one({
                "$or": [
                    {"name": student_ref},
                    {"student_id": student_ref},
                    {"email": student_ref},
                ]
            })

        candidate_name = student.get("name") if student else (student_ref if isinstance(student_ref, str) else "Unknown Student")
        candidate = {
            "id": student.get("student_id") if student else "unknown",
            "name": candidate_name or "Unknown Student",
            "cgpa": float(student.get("cgpa", 0.0)) if student else 0.0,
            "branch": student.get("branch", "CSE") if student else "CSE",
            "skills": list(student.get("skills", [])) if student else [],
            "projects": list(student.get("projects", [])) if student else [],
        }

        formatted_interviews.append({
            "id": str(inv.get("id") or inv.get("_id")),
            "time": inv.get("start_time") or "09:00",
            "status": inv.get("status", "pending"),
            "room": inv.get("room") or "Room TBD",
            "round": inv.get("round") or "Technical Round 1",
            "company": inv.get("company") or "TechNova Solutions",
            "candidate": candidate,
        })

    return {
        "success": True,
        "panelist_name": panelist_name,
        "interviews": formatted_interviews,
    }


@router.post("/feedback")
async def feedback(request: FeedbackRequest, panelist: dict = Depends(get_current_panelist)):
    await db.db["feedback"].insert_one(request.model_dump())

    result = await db.db["interviews"].update_one(
        {"id": request.interview_id},
        {"$set": {"status": "completed"}},
    )

    if result.matched_count == 0:
        try:
            await db.db["interviews"].update_one(
                {"_id": ObjectId(request.interview_id)},
                {"$set": {"status": "completed"}},
            )
        except Exception:
            pass

    return {"success": True, "message": "Feedback securely saved to MongoDB."}