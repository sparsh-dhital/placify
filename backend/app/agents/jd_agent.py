import json
import re

from google import genai
from google.genai import types
from pydantic import BaseModel, Field

from app.core.config import GEMINI_API_KEY


class JobRequirements(BaseModel):
    company_name: str | None = None
    role: str | None = None
    location: str | None = None
    salary: str | None = None
    min_cgpa: float | None = Field(default=None, ge=0, le=10)
    max_backlogs: int | None = Field(default=None, ge=0)
    graduation_year: int | None = Field(default=None, ge=1900, le=2200)
    mandatory_skills: list[str] = Field(default_factory=list)
    preferred_skills: list[str] = Field(default_factory=list)
    experience: str | None = None
    assessment: str | None = None
    interview_rounds: list[str] = Field(default_factory=list)
    other_requirements: list[str] = Field(default_factory=list)


def _deterministic_hard_fields(text: str) -> dict:
    cgpa = re.search(r"(?:minimum|min|at least)\s*(?:cgpa\s*)?(\d+(?:\.\d+)?)", text, re.I)
    backlogs = re.search(r"(\d+)\s*(?:active\s*)?backlogs?", text, re.I)
    graduation = re.search(r"(?:graduat(?:e|ion)|passing)\s*(?:year)?\s*(?:of|:)?\s*(20\d{2})", text, re.I)
    return {
        "min_cgpa": float(cgpa.group(1)) if cgpa else None,
        "max_backlogs": int(backlogs.group(1)) if backlogs else None,
        "graduation_year": int(graduation.group(1)) if graduation else None,
    }


def analyze_jd_with_gemini(text: str) -> JobRequirements:
    if not GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY is not configured")
    client = genai.Client(api_key=GEMINI_API_KEY)
    prompt = """Extract the job requirements from the following job description. Return only JSON matching this schema. Use null for unknown scalar fields and [] for unknown lists. Do not decide whether any student is eligible.
{
  "company_name": null, "role": null, "location": null, "salary": null,
  "min_cgpa": null, "max_backlogs": null, "graduation_year": null,
  "mandatory_skills": [], "preferred_skills": [], "experience": null,
  "assessment": null, "interview_rounds": [], "other_requirements": []
}

JOB DESCRIPTION:
""" + text
    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=JobRequirements,
        ),
    )
    extracted = JobRequirements.model_validate(json.loads(response.text))
    hard_fields = _deterministic_hard_fields(text)
    for field, value in hard_fields.items():
        if value is not None:
            setattr(extracted, field, value)
    return extracted