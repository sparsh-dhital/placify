from fastapi import APIRouter, HTTPException

from app.core.db import get_supabase, rows
from app.models.pydantic_schemas import FeedbackRequest

router = APIRouter(prefix="/api/panel", tags=["panel"])


@router.get("/today")
async def panel_today(panelist_id: str):
	try:
		client = get_supabase()
		interviews = rows(client.table("interviews").select("*, students(*), jobs(company_name, role)").eq("panelist_id", panelist_id).order("start_time").execute())
		normalized = []
		for item in interviews:
			student = item.get("students") or {}
			skill_rows = rows(client.table("student_skills").select("skill_name").eq("student_id", item.get("student_id")).execute())
			job = item.get("jobs") or {}
			normalized.append({"id": str(item["id"]), "time": str(item.get("start_time", ""))[11:16], "candidate": {"id": str(item.get("student_id", "")), "name": student.get("name", ""), "cgpa": student.get("cgpa", 0), "branch": student.get("branch", ""), "skills": [row["skill_name"] for row in skill_rows], "projects": []}, "company": job.get("company_name", ""), "room": item.get("room", ""), "round": "Technical Round 1", "status": "completed" if item.get("status") == "completed" else "pending"})
		return {"success": True, "panelist_name": panelist_id, "interviews": normalized}
	except Exception as exc:
		raise HTTPException(502, "Unable to load the panel schedule") from exc


@router.post("/feedback")
async def submit_feedback(payload: FeedbackRequest):
	try:
		feedback = payload.model_dump()
		feedback.pop("interview_id")
		get_supabase().table("interview_feedback").insert({"interview_id": payload.interview_id, **feedback}).execute()
		get_supabase().table("interviews").update({"status": "completed"}).eq("id", payload.interview_id).execute()
		return {"success": True, "message": "Feedback submitted successfully."}
	except Exception as exc:
		raise HTTPException(502, "Unable to save interview feedback") from exc
