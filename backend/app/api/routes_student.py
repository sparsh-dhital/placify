import os
import json
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from groq import Groq
from database import db
from app.agents.match_agent import match_candidates
from app.core.security import get_current_student

router = APIRouter()

class ResumeSyncPayload(BaseModel):
    cgpa: float | None = None
    skills: list[str] = []
    readiness_score: int = 0

class ResumeParseRequest(BaseModel):
    text: str
    company: str
    role: str
    matched_skills: list[str]
    missing_skills: list[str]

@router.get("/dashboard")
async def dashboard(student: dict = Depends(get_current_student)):
    student_id = student["id"]
    
    student_record = await db.db["students"].find_one({"student_id": student_id})
    
    if not student_record:
        student_record = {
            "student_id": student_id,
            "name": student.get("name", "Demo Student"),   
            "email": student.get("email"), 
            "branch": "Computer Science & Engineering", 
            "cgpa": 0.0,
            "skills": [],
            "shortlist_status": "pending",
            "readiness_score": 0
        }
        await db.db["students"].insert_one(student_record)
        
    active_jobs_cursor = db.db["jobs"].find({"status": "active"})
    active_jobs = await active_jobs_cursor.to_list(length=100)

    if not active_jobs:
        return {
            "success": True, 
            "profile": {
                "name": student_record.get("name", "Demo Student"), 
                "roll_no": student_record.get("roll_no", "Pending"), 
                "branch": student_record.get("branch", "Computer Science & Engineering"),
                "cgpa": student_record.get("cgpa", 0.0), 
                "readiness_score": student_record.get("readiness_score", 0)
            }, 
            "upcoming_interview": None, 
            "job_matches": [], 
            "ai_recommendations": [
                "Your resume demonstrates strong technical capabilities. Consider adding cloud deployment tools to stand out.",
                "Great academic consistency. Focus on building end-to-end fullstack projects to maximize interview readiness."
            ]
        }

    job_matches = []
    highest_score = 0
    
    for job in active_jobs:
        match_data = match_candidates(job, [student_record])
        result = match_data["matches"][0] if match_data.get("matches") else {}
        
        score = result.get("match_score", 0)
        if score > highest_score:
            highest_score = score
            
        job_matches.append({
            "company": job.get("company", "TechNova Solutions"),
            "role": job.get("role", "Software Engineer"),
            "match_score": score,
            "matched_skills": result.get("matched_skills", []),
            "missing_skills": result.get("missing_skills", []),
            "required_skills": job.get("required_skills", []),
            "description": f"Opportunity to work on core enterprise architecture. Requirements: Minimum CGPA {job.get('min_cgpa', '7.0')}, max backlogs {job.get('max_backlogs', '0')}.",
            "min_cgpa": job.get("min_cgpa", 7.0),
            "max_backlogs": job.get("max_backlogs", 0)
        })
        
    job_matches = sorted(job_matches, key=lambda x: x["match_score"], reverse=True)
    
    student_name = student_record.get("name")
    upcoming_raw = await db.db["interviews"].find_one({
        "$or": [
            {"student": student_name},
            {"student_id": student_id}
        ],
        "status": {"$in": ["proposed", "scheduled", "active"]}
    })
    
    upcoming_interview = None
    if upcoming_raw:
        upcoming_interview = {
            "id": str(upcoming_raw.get("id", upcoming_raw.get("_id"))),
            "company": upcoming_raw.get("company", "TechNova Solutions"),
            "round": "Technical Round 1",
            "room": upcoming_raw.get("room", "Room 101"),
            "time": f"{upcoming_raw.get('start_time')} - {upcoming_raw.get('end_time')}",
            "panel": upcoming_raw.get("panel", "Panel A")
        }

    is_empty_profile = student_record.get("cgpa", 0) == 0 and not student_record.get("skills")
    calculated_readiness = 0 if is_empty_profile else highest_score

    ai_recs = [
        "Your resume reflects solid core technical skills. High alignment with software engineering requirements.",
        f"Growth Opportunity: Focus on acquiring experience in: {', '.join(job_matches[0]['missing_skills'][:3]) if job_matches and job_matches[0]['missing_skills'] else 'advanced frameworks'}."
    ]

    return {
        "success": True, 
        "profile": {
            "name": student_record.get("name", "Demo Student"), 
            "roll_no": student_record.get("roll_no", "Pending"), 
            "branch": student_record.get("branch", "Computer Science & Engineering"),
            "cgpa": student_record.get("cgpa", 0.0), 
            "readiness_score": calculated_readiness
        }, 
        "upcoming_interview": upcoming_interview, 
        "job_matches": job_matches, 
        "ai_recommendations": ai_recs
    }


@router.post("/sync-resume")
async def sync_resume_data(payload: ResumeSyncPayload, student: dict = Depends(get_current_student)):
    student_id = student["id"]
    update_data = {
        "skills": payload.skills,
        "readiness_score": payload.readiness_score
    }
    if payload.cgpa is not None:
        update_data["cgpa"] = payload.cgpa

    await db.db["students"].update_one(
        {"student_id": student_id},
        {"$set": update_data},
        upsert=True
    )
    return {"success": True, "message": "Synced successfully."}


@router.post("/parse-resume-llm")
async def parse_resume_llm(payload: ResumeParseRequest, student: dict = Depends(get_current_student)):
    try:
        client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
        
        system_prompt = """
        You are an elite HR Data Extraction Agent. Read the raw OCR resume text provided and extract candidate details into strict JSON.
        
        CRITICAL EXTRACTION RULES:
        1. 'name': Look at the very first few lines of the text. Find the candidate's full legal name (e.g., 'LIZ SHELBY'). NEVER extract names from URLs, GitHub links, or email domains. If a name appears capitalized at the top, use that.
        2. 'cgpa' & 'raw_cgpa': Extract numerical GPA/CGPA. Normalize to a 10.0 scale for 'cgpa' if it's on a 4.0 scale (multiply by 2.5), keeping literal value in 'raw_cgpa'.
        3. 'gpa_type': Return "GPA" or "CGPA".
        4. 'education': Return an array of strings combining degree and full institution name (e.g., ["Bachelor of Computer Science - Northeastern University", "High School Diploma - Excel High School"]).
        5. 'strong_points': Provide 2 engaging, human-friendly sentences highlighting resume strengths.
        6. 'weak_points': Provide 2 constructive, friendly sentences highlighting growth areas.
        7. 'skills': Extract all technical skills as a flat array of strings.
        
        Return STRICT JSON matching this schema:
        {
            "name": "Full Name",
            "email": "Email",
            "phone": "Phone",
            "cgpa": float,
            "raw_cgpa": float,
            "gpa_type": "CGPA",
            "skills": ["Python", "Java"],
            "education": ["Degree - School"],
            "strong_points": ["Strength 1", "Strength 2"],
            "weak_points": ["Growth area 1", "Growth area 2"]
        }
        """

        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": payload.text}
            ],
            model="openai/gpt-oss-20b",
            temperature=0,
            response_format={"type": "json_object"}
        )

        llm_response = chat_completion.choices[0].message.content.strip()
        parsed_data = json.loads(llm_response)

        if not parsed_data.get("name") or "http" in parsed_data.get("name", ""):
            parsed_data["name"] = student.get("name", "Liz Shelby")

        required_skills = payload.matched_skills if payload.matched_skills else ["Python", "Java", "SQL", "React", "Docker", "Git"]
        parsed_skills_lower = [s.lower() for s in parsed_data.get("skills", [])]
        
        matched_skills = [s for s in required_skills if s.lower() in parsed_skills_lower]
        missing_skills = [s for s in required_skills if s.lower() not in parsed_skills_lower]
        
        cgpa_score = max(0, min(100, (parsed_data.get("cgpa") or 8.0) * 10))
        skill_coverage = (len(matched_skills) / len(required_skills) * 100) if required_skills else 50
        final_score = round(cgpa_score * 0.45 + skill_coverage * 0.55)

        eligibility_status = "Eligible" if final_score >= 60 else "Borderline"
        
        await db.db["students"].update_one(
            {"student_id": student["id"]},
            {"$set": {"name": parsed_data.get("name")}}
        )

        return {
            "success": True,
            "company": payload.company,
            "role": payload.role,
            "required_skills": required_skills,
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
            "eligibility_score": final_score,
            "eligibility_status": eligibility_status,
            "reasons": ["Validated against company skill vector."],
            "parsed": parsed_data
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM Error: {str(e)}")