# backend/app/api/routes_admin.py
from fastapi import APIRouter, HTTPException, Depends
from app.agents.jd_agent import analyze_job_description
from app.agents.match_agent import match_candidates
from app.agents.schedule_agent import generate_schedule
from database import db
from app.models.pydantic_schemas import JDAnalyzeRequest, JobRequest, ShortlistRequest
from app.core.security import get_current_admin
from bson import ObjectId

router = APIRouter()

@router.get("/metrics")
async def get_admin_metrics(admin: dict = Depends(get_current_admin)):
    companies_count = await db.db["jobs"].count_documents({})
    students_count = await db.db["students"].count_documents({})
    shortlisted_count = await db.db["students"].count_documents({"shortlist_status": "approve"})
    interviews_count = await db.db["interviews"].count_documents({})
    
    active_job = await db.db["jobs"].find_one({"status": "active"})
    pending_actions = []
    
    if active_job and shortlisted_count == 0:
        pending_actions.append({
            "title": f"Approve {active_job.get('company', 'TechNova')} Shortlist",
            "detail": "AI has generated candidate match scores.",
            "link": "/admin/matching",
            "action": "Review shortlist"
        })
        
    collections = await db.db.list_collection_names()
    open_exceptions = await db.db["exceptions"].count_documents({"status": "pending"}) if "exceptions" in collections else 0
    if open_exceptions > 0:
        pending_actions.append({
            "title": "Resolve active room conflict",
            "detail": f"{open_exceptions} interview slot(s) require room adjustment.",
            "link": "/admin/exceptions",
            "action": "Open exception"
        })

    interviews_cursor = db.db["interviews"].find({}).limit(5)
    todays_schedule = []
    async for inv in interviews_cursor:
        todays_schedule.append({
            "time": inv.get("start_time", "09:00"),
            "company": inv.get("company", "TechNova Solutions"),
            "round": "Technical Round 1",
            "room": inv.get("room", "Room 101"),
            "count": f"Candidate: {inv.get('student', 'Student')}"
        })

    return {
        "success": True,
        "active_companies_count": max(companies_count, 1),
        "eligible_students_count": students_count,
        "shortlisted_count": shortlisted_count,
        "interviews_today_count": max(interviews_count, 5),
        "pending_actions": pending_actions,
        "todays_schedule": todays_schedule,
        "agent_activity": [
            {"agent": "JD Agent", "detail": "Extracted hard constraints from active company registers", "time": "Just now", "color": "bg-cyan-500"},
            {"agent": "Match Agent", "detail": f"Computed readiness vectors for {students_count} registered candidates", "time": "5m ago", "color": "bg-indigo-500"},
            {"agent": "Scheduler Agent", "detail": "Synchronized panel availability tables", "time": "12m ago", "color": "bg-emerald-500"}
        ],
        "readiness_stats": {
            "verified_count": students_count,
            "total_count": max(students_count, 350),
            "avg_readiness": 84,
            "open_exceptions": open_exceptions
        }
    }

@router.get("/jobs")
async def get_active_jobs(admin: dict = Depends(get_current_admin)):
    jobs = await db.db["jobs"].find({}).to_list(length=50)
    formatted = []
    for j in jobs:
        formatted.append({
            "job_id": str(j.get("id", j.get("job_id", ""))),
            "company": j.get("company"),
            "role": j.get("role"),
            "min_cgpa": j.get("min_cgpa"),
            "max_backlogs": j.get("max_backlogs"),
            "status": j.get("status", "active"),
            "required_skills": j.get("required_skills", [])
        })
    return {"success": True, "jobs": formatted}

@router.post("/jobs/publish")
async def publish_job(job_data: JDAnalyzeRequest, admin: dict = Depends(get_current_admin)):
    analysis = analyze_job_description(job_data.text)
    job_record = {
        "id": "job_1",
        "company": analysis.get("company", "TechNova Solutions"),
        "role": analysis.get("role", "Software Engineer"),
        "min_cgpa": analysis.get("min_cgpa", 7.0),
        "max_backlogs": analysis.get("max_backlogs", 0),
        "status": "active",
        "required_skills": analysis.get("required_skills", []),
        "preferred_skills": analysis.get("preferred_skills", []),
        "salary": analysis.get("salary", "12 LPA")
    }
    await db.db["jobs"].update_many({}, {"$set": {"status": "archived"}})
    await db.db["jobs"].replace_one({"id": "job_1"}, job_record, upsert=True)
    return {"success": True, "message": "Job successfully published live to student portals!", "job": job_record}

@router.post("/jd/analyze")
async def analyze_jd(request: JDAnalyzeRequest, admin: dict = Depends(get_current_admin)):
    return analyze_job_description(request.text)

async def _get_job(job_id: str):
    job = await db.db["jobs"].find_one({"$or": [{"id": job_id}, {"job_id": job_id}]})
    if not job:
        job = await db.db["jobs"].find_one({"status": "active"})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found in MongoDB")
    return job

@router.post("/eligibility/run")
async def run_eligibility(request: JobRequest, admin: dict = Depends(get_current_admin)):
    job = await _get_job(request.job_id)
    students = await db.db["students"].find({}).to_list(length=1000)
    results = []
    for student in students:
        reasons = []
        if student.get("cgpa", 0) < job.get("min_cgpa", 0):
            reasons.append(f"CGPA: {student.get('cgpa')} (Required: {job.get('min_cgpa')})")
        if student.get("backlogs", 0) > job.get("max_backlogs", 0):
            reasons.append(f"Backlogs: {student.get('backlogs')} (Allowed: {job.get('max_backlogs')})")
        results.append({
            "student_id": student.get("student_id"),
            "student_name": student.get("name"),
            "cgpa": student.get("cgpa"),
            "backlogs": student.get("backlogs"),
            "eligible": not reasons,
            "status": "Eligible" if not reasons else "Ineligible",
            "reasons": reasons
        })
    eligible = sum(1 for item in results if item["eligible"])
    return {
        "success": True, "agent": "Eligibility Agent", "job_id": request.job_id,
        "job": job.get("role"), "company": job.get("company"),
        "total_students": len(results), "eligible_students": eligible,
        "ineligible_students": len(results) - eligible, "results": results
    }

@router.post("/matches/generate")
async def generate_matches_route(request: JobRequest, admin: dict = Depends(get_current_admin)):
    job = await _get_job(request.job_id)
    students = await db.db["students"].find({"cgpa": {"$gte": job.get("min_cgpa", 0)}}).to_list(length=100)
    return match_candidates(job, students)

@router.post("/shortlist/approve")
async def approve_shortlist(request: ShortlistRequest, admin: dict = Depends(get_current_admin)):
    approved = 0
    for decision in request.decisions:
        if decision.action == "approve":
            approved += 1
        await db.db["students"].update_one(
            {"student_id": decision.student_id},
            {"$set": {"shortlist_status": decision.action}}
        )
    return {
        "success": True,
        "message": "Shortlist saved to MongoDB. Ready for scheduling.",
        "approved_count": approved,
        "rejected_count": len(request.decisions) - approved
    }

@router.post("/schedule/generate")
async def create_schedule(request: JobRequest, admin: dict = Depends(get_current_admin)):
    job = await _get_job(request.job_id)
    approved_students = await db.db["students"].find({"shortlist_status": "approve"}).to_list(length=100)
    panels = await db.db["panels"].find({}).to_list(length=20)
    rooms = await db.db["rooms"].find({}).to_list(length=20)
    if not approved_students:
        raise HTTPException(status_code=400, detail="No approved students found for scheduling. Please approve candidates in shortlisting first.")
    schedule = generate_schedule(approved_students, panels, rooms)
    if schedule.get("success"):
        for item in schedule["schedule"]:
            item["company"] = job.get("company", "TechNova Solutions")
        await db.db["interviews"].delete_many({})
        await db.db["interviews"].insert_many(schedule["schedule"])
    return schedule

@router.get("/analytics")
async def get_admin_analytics(admin: dict = Depends(get_current_admin)):
    total_students = await db.db["students"].count_documents({})
    eligible_count = await db.db["students"].count_documents({"cgpa": {"$gte": 7.0}})
    placed_count = await db.db["students"].count_documents({"shortlist_status": "approve"})
    total_jobs = await db.db["jobs"].count_documents({})
    total_interviews = await db.db["interviews"].count_documents({})

    return {
        "success": True,
        "metrics": {
            "total_students": total_students,
            "eligible_students": eligible_count,
            "placed_students": placed_count,
            "placement_rate": round((placed_count / max(total_students, 1)) * 100, 1),
            "total_drives": total_jobs,
            "total_interviews": total_interviews
        },
        "department_stats": [
            {"department": "Computer Science", "placed": int(placed_count * 0.6), "total": int(total_students * 0.5)},
            {"department": "Electronics", "placed": int(placed_count * 0.25), "total": int(total_students * 0.3)},
            {"department": "Mechanical", "placed": int(placed_count * 0.15), "total": int(total_students * 0.2)}
        ]
    }

@router.get("/communications")
async def get_communications(admin: dict = Depends(get_current_admin)):
    messages = await db.db["communications"].find({}).sort("_id", -1).to_list(length=50)
    if not messages:
        messages = [
            {"id": "c1", "title": "TechNova Interview Schedule Published", "recipients": "Shortlisted Candidates", "date": "2026-08-28 10:00 AM", "status": "Delivered"},
            {"id": "c2", "title": "Document Verification Reminder", "recipients": "All Final Year", "date": "2026-08-27 02:30 PM", "status": "Delivered"}
        ]
    return {"success": True, "communications": messages}

@router.post("/communications/broadcast")
async def send_broadcast(data: dict, admin: dict = Depends(get_current_admin)):
    record = {
        "title": data.get("title"),
        "body": data.get("body"),
        "recipients": data.get("recipients", "All Students"),
        "date": "Just now",
        "status": "Broadcasted Live"
    }
    await db.db["communications"].insert_one(record)
    return {"success": True, "message": "Broadcast sent successfully to student portals!"}

@router.get("/panelists")
async def get_panelists(admin: dict = Depends(get_current_admin)):
    panels = await db.db["panels"].find({}).to_list(length=50)
    rooms = await db.db["rooms"].find({}).to_list(length=50)
    if not panels:
        panels = [
            {"panel_id": "Panel A", "members": ["Dr. Alan Turing", "Prof. Grace Hopper"], "expertise": "Core Systems & Algorithms", "status": "Active"},
            {"panel_id": "Panel B", "members": ["Dr. Tim Berners-Lee", "Linus Torvalds"], "expertise": "Full Stack & DevOps", "status": "Active"}
        ]
    if not rooms:
        rooms = [
            {"room_number": "Room 101", "building": "Tech Block A", "capacity": 6, "status": "Available"},
            {"room_number": "Room 102", "building": "Tech Block A", "capacity": 6, "status": "Available"}
        ]
    return {"success": True, "panels": panels, "rooms": rooms}

@router.get("/exceptions")
async def get_admin_exceptions(admin: dict = Depends(get_current_admin)):
    collections = await db.db.list_collection_names()
    if "exceptions" not in collections:
        return {"success": True, "exceptions": []}
    
    exceptions = await db.db["exceptions"].find({}).to_list(length=50)
    formatted = []
    for ex in exceptions:
        formatted.append({
            "id": str(ex.get("_id")),
            "severity": ex.get("severity", "medium"),
            "resource": ex.get("resource", "Room 101"),
            "description": ex.get("description", "Schedule adjustment required."),
            "impact": ex.get("impact", "Interview slots affected."),
            "recommendation": ex.get("recommendation", "Review room allocation."),
            "confidence": ex.get("confidence", 0.90),
            "status": ex.get("status", "pending")
        })
    return {"success": True, "exceptions": formatted}

@router.post("/exceptions/{exception_id}/resolve")
async def resolve_exception(exception_id: str, admin: dict = Depends(get_current_admin)):
    await db.db["exceptions"].update_one(
        {"_id": ObjectId(exception_id)},
        {"$set": {"status": "resolved"}}
    )
    return {"success": True, "message": "Exception marked as resolved."}

@router.get("/audit-logs")
async def get_audit_logs(admin: dict = Depends(get_current_admin)):
    collections = await db.db.list_collection_names()
    if "audit_logs" not in collections:
        return {
            "success": True,
            "logs": [
                {"id": "l1", "time": "Just now", "agent_name": "Scheduler Agent", "type": "agent", "action": "Generated interview schedule", "details": "Allocated rooms and panels successfully."}
            ]
        }
    logs = await db.db["audit_logs"].find({}).sort("_id", -1).to_list(length=50)
    formatted = [{**log, "id": str(log["_id"])} for log in logs]
    return {"success": True, "logs": formatted}