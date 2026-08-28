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
            "name": student.get("name"),   
            "email": student.get("email"), 
            "branch": "Branch Not Set", 
            "cgpa": 0.0,
            "skills": [],
            "shortlist_status": "pending"
        }
        await db.db["students"].insert_one(student_record)
        
    job = await db.db["jobs"].find_one({"status": "active"})
    if not job:
        return {
            "success": True, 
            "profile": {
                "name": student_record.get("name", "Student"), 
                "roll_no": student_record.get("roll_no", "Pending"), 
                "branch": student_record.get("branch", "Branch Not Set"),
                "cgpa": student_record.get("cgpa", 0.0), 
                "readiness_score": 0
            }, 
            "upcoming_interview": None, 
            "job_matches": [], 
            "ai_recommendations": ["No active recruitment drives found. Active opportunities will populate here once an administrator posts an approved job description."]
        }
        
    match_data = match_candidates(job, [student_record])
    result = match_data["matches"][0] if match_data.get("matches") else {
        "match_score": 0, "matched_skills": [], "missing_skills": [], "explanation": "Profile evaluation pending."
    }
        
    upcoming = await db.db["interviews"].find_one({"student_id": student_id, "status": "proposed"})

    return {
        "success": True, 
        "profile": {
            "name": student_record.get("name", "Student"), 
            "roll_no": student_record.get("roll_no", "Pending"), 
            "branch": student_record.get("branch", "Branch Not Set"),
            "cgpa": student_record.get("cgpa", 0.0), 
            "readiness_score": result.get("match_score", 0)
        }, 
        "upcoming_interview": {
            "company": job.get("company", "Unknown"),
            "role": job.get("role", "Role"),
            "date": upcoming.get("start_time", "TBD").split("T")[0] if upcoming else "TBD",
            "time": upcoming.get("start_time", "TBD").split("T")[-1] if upcoming else "TBD",
            "room": upcoming.get("room", "TBD") if upcoming else "TBD",
            "panel": upcoming.get("panel", "TBD") if upcoming else "TBD",
            "status": "Confirmed" if upcoming else "Pending"
        } if upcoming else None, 
        "job_matches": [{
            "company": job.get("company"),
            "role": job.get("role"),
            "match_score": result.get("match_score", 0),
            "matched_skills": result.get("matched_skills", []),
            "missing_skills": result.get("missing_skills", [])
        }], 
        "ai_recommendations": [
            result.get("explanation", ""),
            f"Focus on acquiring missing skills: {', '.join(result.get('missing_skills', []))}" if result.get("missing_skills") else "Profile is highly optimized."
        ]
    }

@router.post("/sync-resume")
async def sync_resume_data(payload: ResumeSyncPayload, student: dict = Depends(get_current_student)):
    student_id = student["id"]
    
    update_data = {
        "skills": payload.skills,
    }
    if payload.cgpa is not None:
        update_data["cgpa"] = payload.cgpa

    await db.db["students"].update_one(
        {"student_id": student_id},
        {"$set": update_data},
        upsert=True
    )
    
    return {"success": True, "message": "Resume data synced to profile successfully."}


@router.post("/parse-resume-llm")
async def parse_resume_llm(payload: ResumeParseRequest, student: dict = Depends(get_current_student)):
    try:
        client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
        
        system_prompt = f"""
        You are an expert HR Data Extraction Agent. Read the raw OCR resume text provided and extract candidate details accurately.
        
        CRITICAL INSTRUCTIONS:
        1. 'name': Extract the exact human candidate name written on the resume document.
        2. 'cgpa' & 'raw_cgpa': Extract the numerical score. If on a 4.0 or 5.0 scale, normalize it to a 10.0 scale for 'cgpa', but keep the literal un-normalized value in 'raw_cgpa'. If no GPA/CGPA is found, set both to null.
        3. 'gpa_type': Return strictly "GPA" if the document uses a 4-point scale or explicitly mentions GPA. Return "CGPA" if it uses a 10-point scale or mentions CGPA. If not found, default to "CGPA".
        4. 'education': Return an array of distinct strings for each school or degree entry (e.g., ["B.A. - University of Chicago", "High School Diploma - School Name"]).
        5. 'strong_points': Give 2 natural, clear, non-repetitive sentences highlighting what the resume does well.
        6. 'weak_points': Give 2 natural, clear, actionable sentences suggesting constructive improvements.
        7. Return ONLY a raw JSON object. Do not include markdown formatting or explanations.
        
        Expected JSON Schema:
        {{
            "name": "string or null",
            "email": "string or null",
            "phone": "string or null",
            "cgpa": float or null,
            "raw_cgpa": float or null,
            "gpa_type": "CGPA" or "GPA",
            "skills": ["list", "of", "skills"],
            "education": ["School 1", "School 2"],
            "strong_points": ["point 1", "point 2"],
            "weak_points": ["point 1", "point 2"]
        }}
        """

        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": payload.text}
            ],
            model="openai/gpt-oss-20b", 
            temperature=0,
        )

        llm_response = chat_completion.choices[0].message.content.strip()
        if llm_response.startswith("```json"):
            llm_response = llm_response.replace("```json", "").replace("```", "").strip()
        elif llm_response.startswith("```"):
            llm_response = llm_response.replace("```", "").strip()
            
        parsed_data = json.loads(llm_response)

        required_skills_lower = [s.lower() for s in payload.matched_skills]
        parsed_skills_lower = [s.lower() for s in parsed_data.get("skills", [])]
        
        matched_skills = [s for s in payload.matched_skills if s.lower() in parsed_skills_lower]
        missing_skills = [s for s in payload.matched_skills if s.lower() not in parsed_skills_lower]
        
        cgpa_score = max(0, min(100, (parsed_data.get("cgpa") or 0) * 10))
        skill_coverage = (len(matched_skills) / len(payload.matched_skills) * 100) if payload.matched_skills else 0
        final_score = round(cgpa_score * 0.45 + skill_coverage * 0.55)

        eligibility_status = "Not Eligible"
        if final_score >= 75 and (parsed_data.get("cgpa") is None or parsed_data.get("cgpa") >= 7.0):
            eligibility_status = "Eligible"
        elif final_score >= 55:
            eligibility_status = "Borderline"

        reasons = []
        if parsed_data.get("cgpa") is not None and parsed_data.get("cgpa") < 7:
            reasons.append("CGPA below the target eligibility threshold.")
        if missing_skills:
            reasons.append(f"Missing key skills: {', '.join(missing_skills)}.")

        return {
            "success": True,
            "company": payload.company,
            "role": payload.role,
            "required_skills": payload.matched_skills,
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
            "eligibility_score": final_score,
            "eligibility_status": eligibility_status,
            "reasons": reasons if reasons else ["Strong match with the company requirements."],
            "parsed": parsed_data
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM Parsing Engine Error: {str(e)}")