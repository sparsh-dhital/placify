import logging
from uuid import uuid4

from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status

from app.core.config import get_settings
from app.core.db import get_supabase, one, rows
from app.agents.match_agent import match_student
from app.models.pydantic_schemas import ResumeUploadResponse, StudentProfile
from app.utils.pdf_extractor import ResumeParseError, extract_text
from app.utils.resume_parser import parse_profile

router = APIRouter(prefix="/api/student", tags=["student"])
ALLOWED = {".pdf", ".docx", ".txt", ".jpg", ".jpeg", ".png"}
logger = logging.getLogger(__name__)


def _student_row(client, student_id: str) -> dict | None:
    try:
        exact_match = one(client.table("students").select("*").eq("id", student_id).execute())
        if exact_match:
            return exact_match
    except Exception:
        pass
    candidates = rows(client.table("students").select("*").execute())
    if student_id.lower().startswith("s") and student_id[1:].isdigit():
        index = int(student_id[1:]) - 1
        return candidates[index] if 0 <= index < len(candidates) else None
    normalized_id = student_id.lower().replace(".", " ").replace("_", " ").replace("-", " ")
    return next(
        (
            item
            for item in candidates
            if str(item.get("roll_no", "")).lower() == student_id.lower()
            or str(item.get("user_id", "")).lower() == student_id.lower()
            or normalized_id in str(item.get("name", "")).lower().split()
        ),
        None,
    )


@router.post("/upload-resume", response_model=ResumeUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_resume(student_id: str = Form(...), file: UploadFile = File(...)):
    filename = file.filename or "resume"
    extension = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if extension not in ALLOWED:
        raise HTTPException(415, "Unsupported resume format")
    content = await file.read()
    if len(content) > get_settings().max_upload_size_mb * 1024 * 1024:
        raise HTTPException(413, "Resume exceeds the upload size limit")
    try:
        text = extract_text(filename, content)
        profile = parse_profile(text, student_id)
    except ResumeParseError as exc:
        raise HTTPException(422, str(exc)) from exc
    if not text.strip():
        raise HTTPException(422, "The resume did not contain readable text")
    client = get_supabase()
    student = _student_row(client, student_id)
    if not student:
        display_name = profile.name if profile.name != "Unknown Student" else student_id.split(".")[-1].replace("_", " ").title()
        student = one(
            client.table("students")
            .insert({"id": str(uuid4()), "name": display_name, "roll_no": student_id, "branch": "", "cgpa": 0})
            .execute()
        )
        if not student:
            raise HTTPException(502, "Supabase could not create the student profile")
    database_student_id = str(student["id"])
    student_updates = {"name": profile.name}
    if profile.roll_no:
        student_updates["roll_no"] = profile.roll_no
    if profile.branch:
        student_updates["branch"] = profile.branch
    if profile.cgpa:
        student_updates["cgpa"] = profile.cgpa
    if profile.graduation_year is not None:
        student_updates["graduation_year"] = profile.graduation_year
    try:
        client.table("students").update(student_updates).eq("id", database_student_id).execute()
        client.table("student_skills").delete().eq("student_id", database_student_id).execute()
        if profile.skills:
            client.table("student_skills").insert([{"student_id": database_student_id, "skill_name": skill, "source": "resume"} for skill in profile.skills]).execute()
        try:
            resume = one(client.table("resumes").insert({"student_id": database_student_id, "file_name": filename, "mime_type": file.content_type, "raw_text": text}).execute())
        except Exception as exc:
            if "PGRST205" not in str(exc) or "public.resumes" not in str(exc):
                raise
            logger.warning("Resume history table is not available; profile and skills were saved")
            resume = None
    except Exception as exc:
        logger.exception("Failed to save resume profile for student %s", student_id)
        raise HTTPException(502, "Supabase could not save the resume profile") from exc
    return ResumeUploadResponse(student_id=student_id, resume_id=str(resume["id"]) if resume else "", profile=profile, resume_text=text, skills_saved=len(profile.skills))


@router.get("/dashboard")
async def student_dashboard(student_id: str):
    client = get_supabase()
    try:
        student = _student_row(client, student_id)
        if not student:
            raise HTTPException(404, "Student not found")
        skill_rows = rows(client.table("student_skills").select("skill_name").eq("student_id", student["id"]).execute())
        interviews = rows(client.table("interviews").select("*, jobs(company_name, role)").eq("student_id", student["id"]).in_("status", ["confirmed", "proposed"]).order("start_time").limit(1).execute())
        profile_skills = [item["skill_name"] for item in skill_rows]
        profile = {**student, "backlogs": student.get("backlog_count", student.get("backlogs", 0)), "skills": profile_skills, "readiness_score": student.get("readiness_score") or min(100, int(float(student.get("cgpa") or 0) * 10) + len(profile_skills) * 5)}
        interview = None
        if interviews:
            item = interviews[0]
            job = item.get("jobs") or {}
            interview = {"company": job.get("company", job.get("company_name", "")), "role": job.get("role", ""), "date": str(item.get("start_time", ""))[:10], "time": str(item.get("start_time", ""))[11:16], "room": item.get("room", ""), "panel": item.get("panelist_id", ""), "status": item.get("status", "")}
        jobs = rows(client.table("jobs").select("*").execute())
        jobs = [job for job in jobs if job.get("status") in {"open", "approved", "published", "draft"}]
        matches = []
        recommendations: list[str] = []
        for job in jobs:
            job["required_skills"] = [item["skill_name"] for item in rows(client.table("job_skills").select("skill_name").eq("job_id", job["id"]).eq("skill_type", "mandatory").execute())]
            job["preferred_skills"] = [item["skill_name"] for item in rows(client.table("job_skills").select("skill_name").eq("job_id", job["id"]).eq("skill_type", "preferred").execute())]
            match = match_student(student, job, set(profile_skills))
            match["company"] = job.get("company", job.get("company_name", ""))
            match["role"] = job.get("role", "")
            match["min_cgpa"] = float(job.get("min_cgpa") or 0)
            match["max_backlogs"] = int(job.get("max_backlogs") or 0)
            match["required_skills"] = job["required_skills"]
            match["preferred_skills"] = job["preferred_skills"]
            matches.append(match)
            recommendations.extend(f"Build evidence for {skill} to improve your {match['role']} match." for skill in match["missing_skills"][:2])
        return {"success": True, "profile": profile, "upcoming_interview": interview, "job_matches": sorted(matches, key=lambda item: item["match_score"], reverse=True)[:10], "ai_recommendations": list(dict.fromkeys(recommendations))[:5]}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(502, "Unable to load the student dashboard") from exc
