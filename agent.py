import os
import re
from typing import Optional, TypedDict, List
from dotenv import load_dotenv
from pydantic import BaseModel, Field
from langchain_groq import ChatGroq
from langgraph.graph import StateGraph, END

load_dotenv()

# Define schema for structured extraction
class EligibilityRules(BaseModel):
    min_cgpa: float = Field(description="Minimum CGPA required")
    required_skills: List[str] = Field(
        description="List every required technical skill as a separate item"
    )


class ResumeProfile(BaseModel):
    name: Optional[str] = Field(default=None, description="Candidate full name")
    email: Optional[str] = Field(default=None, description="Candidate email address")
    phone: Optional[str] = Field(default=None, description="Candidate phone number")
    education: List[str] = Field(default_factory=list, description="Education details")
    cgpa: Optional[float] = Field(default=None, description="CGPA stated in the resume")
    experience: List[str] = Field(default_factory=list, description="Work experience details")
    projects: List[str] = Field(default_factory=list, description="Project details")
    certifications: List[str] = Field(default_factory=list, description="Certifications")
    technical_skills: List[str] = Field(
        default_factory=list,
        description="Technical skills explicitly demonstrated in the resume",
    )
    soft_skills: List[str] = Field(
        default_factory=list,
        description="Soft skills explicitly demonstrated in the resume",
    )

# Define Agent State
class GraphState(TypedDict):
    jd_text: str
    parsed_rules: dict
    student_cgpa: float
    student_skills: List[str]
    resume_text: str
    resume_profile: dict
    is_eligible: bool
    reason: str
    requirement_results: List[dict]
    readiness_score: dict


def normalize_skill(skill: str) -> str:
    """Normalize common skill spellings before comparing them."""
    normalized = skill.strip().lower()
    normalized = normalized.replace("c/c++", "cplusplus")
    normalized = normalized.replace("c ++", "cplusplus")
    normalized = normalized.replace("c++", "cplusplus")
    normalized = normalized.replace("c #", "csharp")
    normalized = normalized.replace("c#", "csharp")
    return re.sub(r"[^a-z0-9]+", "", normalized)


def skill_is_in_resume(skill: str, resume_text: str) -> bool:
    """Check the raw resume for a required skill missed by structured extraction."""
    aliases = {
        "cplusplus": [r"c\s*\+\+", r"c\s*/\s*c\+\+", r"cplusplus"],
        "csharp": [r"c\s*#", r"csharp"],
    }
    normalized_skill = normalize_skill(skill)
    patterns = aliases.get(
        normalized_skill,
        [
            rf"(?<![a-z0-9]){re.escape(skill.strip()).replace(r'\ ', r'\s+')}(?![a-z0-9])"
        ],
    )
    return any(re.search(pattern, resume_text, re.IGNORECASE) for pattern in patterns)


def requirement_is_met(requirement: str, student_skills: set[str], resume_text: str) -> bool:
    """Match a requirement directly or through a known skill inside its wording."""
    normalized_requirement = normalize_skill(requirement)
    if normalized_requirement in student_skills or skill_is_in_resume(requirement, resume_text):
        return True
    return any(
        normalize_skill(skill) in normalized_requirement
        and skill_is_in_resume(skill, resume_text)
        for skill in extract_explicit_skills(requirement)
    )


def extract_explicit_skills(resume_text: str) -> List[str]:
    """Find common technologies directly in resume text as an LLM safety net."""
    known_skills = [
        "Python", "Java", "JavaScript", "TypeScript", "C++", "C#", "Go", "Rust",
        "SQL", "HTML", "CSS", "React", "Angular", "Vue", "Node.js", "Django",
        "Flask", "FastAPI", "Spring", "Docker", "Kubernetes", "AWS", "Azure",
        "GCP", "Git", "Linux", "MongoDB", "PostgreSQL", "MySQL", "Redis",
        "TensorFlow", "PyTorch", "Excel",
    ]
    return [skill for skill in known_skills if skill_is_in_resume(skill, resume_text)]


def enrich_resume_profile(profile: dict, resume_text: str) -> dict:
    """Fill important profile fields that structured extraction may omit."""
    lines = [line.strip() for line in resume_text.splitlines() if line.strip()]

    if not profile.get("email"):
        email_match = re.search(r"[\w.+-]+@[\w-]+\.[\w.-]+", resume_text)
        profile["email"] = email_match.group(0) if email_match else None

    if not profile.get("phone"):
        phone_match = re.search(r"(?:\+?\d[\d\s().-]{8,}\d)", resume_text)
        profile["phone"] = phone_match.group(0).strip() if phone_match else None

    if not profile.get("name") and lines:
        profile["name"] = lines[0][:100]

    if profile.get("cgpa") is None:
        cgpa_match = re.search(r"(?:cgpa|gpa)\s*[:=-]?\s*(\d(?:\.\d{1,2})?)", resume_text, re.I)
        if cgpa_match:
            profile["cgpa"] = float(cgpa_match.group(1))

    section_names = {
        "education": ("education", "academic background", "qualifications"),
        "experience": ("experience", "work experience", "employment"),
        "projects": ("projects", "personal projects", "academic projects"),
        "certifications": ("certifications", "certificates", "licenses"),
    }
    heading_pattern = re.compile(
        r"^(?:education|academic background|qualifications|experience|work experience|employment|"
        r"projects|personal projects|academic projects|certifications|certificates|licenses)\s*:?$",
        re.I,
    )
    for field, headings in section_names.items():
        if profile.get(field):
            continue
        for index, line in enumerate(lines):
            if line.lower().rstrip(":") in headings:
                section_lines = []
                for next_line in lines[index + 1:]:
                    if heading_pattern.match(next_line):
                        break
                    section_lines.append(next_line)
                if section_lines:
                    profile[field] = section_lines[:10]
                break

    return profile


def simulate_eligibility(
    rules: dict,
    student_cgpa: float,
    student_skills: List[str],
    simulated_cgpa: Optional[float] = None,
    added_skills: Optional[List[str]] = None,
) -> dict:
    """Run a what-if eligibility check without invoking the language model."""
    cgpa = student_cgpa if simulated_cgpa is None else simulated_cgpa
    skills = {
        normalize_skill(skill)
        for skill in student_skills + (added_skills or [])
        if skill.strip()
    }
    required_skills = {
        normalize_skill(skill)
        for skill in rules.get("required_skills", [])
        if skill.strip()
    }
    missing_skills = sorted(required_skills - skills)
    cgpa_met = cgpa >= rules.get("min_cgpa", 0)

    return {
        "is_eligible": cgpa_met and not missing_skills,
        "cgpa": cgpa,
        "cgpa_requirement_met": cgpa_met,
        "missing_skills": missing_skills,
    }


def calculate_readiness_score(
    profile: dict,
    rules: dict,
    student_cgpa: float,
    student_skills: List[str],
    resume_text: str = "",
) -> dict:
    """Return an explainable 100-point placement readiness breakdown."""
    required_skills = {
        normalize_skill(skill)
        for skill in rules.get("required_skills", [])
        if skill.strip()
    }
    candidate_skills = {
        normalize_skill(skill)
        for skill in student_skills
        if skill.strip()
    }
    candidate_skills.update(
        normalize_skill(requirement)
        for requirement in rules.get("required_skills", [])
        if requirement_is_met(requirement, candidate_skills, resume_text)
    )
    skill_score = (
        len(required_skills & candidate_skills) / len(required_skills) * 40
        if required_skills
        else 40
    )
    cgpa_score = min(student_cgpa / 10, 1) * 25
    experience_score = min(len(profile.get("experience", [])), 3) / 3 * 15
    project_score = min(len(profile.get("projects", [])), 3) / 3 * 10
    certification_score = min(len(profile.get("certifications", [])), 2) / 2 * 5
    education_score = 5 if profile.get("education") else 0
    total = round(
        skill_score
        + cgpa_score
        + experience_score
        + project_score
        + certification_score
        + education_score
    )

    return {
        "total": total,
        "out_of": 100,
        "breakdown": {
            "required_skills": round(skill_score),
            "cgpa": round(cgpa_score),
            "experience": round(experience_score),
            "projects": round(project_score),
            "certifications": round(certification_score),
            "education": education_score,
        },
    }

# Node 1: Extract criteria from Job Description
def parse_jd_node(state: GraphState):
    # Use an available text model from your Groq account list
    llm = ChatGroq(model_name="openai/gpt-oss-120b", temperature=0)
    structured_llm = llm.with_structured_output(EligibilityRules)
    
    result = structured_llm.invoke(f"Extract eligibility criteria from this JD: {state['jd_text']}")
    return {"parsed_rules": result.model_dump()}


# Node 2: Extract skills from the uploaded resume
def parse_resume_node(state: GraphState):
    llm = ChatGroq(model_name="openai/gpt-oss-120b", temperature=0)
    structured_llm = llm.with_structured_output(ResumeProfile)

    result = structured_llm.invoke(
        "Extract every available detail from this resume into the requested fields. "
        "Never omit a detail that is explicitly present. Use null only when a single-value "
        "field is absent, and use an empty list only when an entire section is absent. "
        "Keep every education, experience, project, and certification entry as a separate item.\n\n"
        f"{state['resume_text']}"
    )
    profile = result.model_dump()
    profile = enrich_resume_profile(profile, state["resume_text"])
    detected_skills = extract_explicit_skills(state["resume_text"])
    profile["technical_skills"] = list(
        dict.fromkeys(profile["technical_skills"] + detected_skills)
    )
    return {
        "student_skills": profile["technical_skills"],
        "resume_profile": profile,
    }


# Node 2: Evaluate Student Eligibility
def evaluate_student_node(state: GraphState):
    rules = state["parsed_rules"]
    cgpa = state["student_cgpa"]
    required_skill_names = {
        normalize_skill(skill): skill.strip()
        for skill in rules["required_skills"]
        if skill.strip()
    }
    required_skills = set(required_skill_names)
    student_skills = {
        normalize_skill(skill)
        for skill in state["student_skills"]
        if skill.strip()
    }
    resume_text = state.get("resume_text", "")
    profile = state.get("resume_profile", {})

    requirement_results = [
        {
            "requirement": required_skill_names[skill],
            "met": requirement_is_met(
                required_skill_names[skill],
                student_skills,
                resume_text,
            ),
        }
        for skill in sorted(required_skills)
    ]
    readiness_score = calculate_readiness_score(
        profile,
        rules,
        cgpa,
        list(student_skills),
        resume_text,
    )
    
    if cgpa < rules["min_cgpa"]:
        return {
            "is_eligible": False, 
            "reason": f"CGPA ({cgpa}) is below required minimum threshold of {rules['min_cgpa']}.",
            "requirement_results": requirement_results,
            "readiness_score": readiness_score,
        }

    missing_skills = [
        result["requirement"]
        for result in requirement_results
        if not result["met"]
    ]

    if missing_skills:
        return {
            "is_eligible": False,
            "reason": f"Missing required skills: {', '.join(missing_skills)}.",
            "requirement_results": requirement_results,
            "readiness_score": readiness_score,
        }
    
    return {
        "is_eligible": True,
        "reason": "Eligible! All required skills are present.",
        "requirement_results": requirement_results,
        "readiness_score": readiness_score,
    }

# Build LangGraph StateGraph Workflow
workflow = StateGraph(GraphState)
workflow.add_node("parse_jd", parse_jd_node)
workflow.add_node("parse_resume", parse_resume_node)
workflow.add_node("evaluate_student", evaluate_student_node)

workflow.set_entry_point("parse_jd")
workflow.add_edge("parse_jd", "parse_resume")
workflow.add_edge("parse_resume", "evaluate_student")
workflow.add_edge("evaluate_student", END)

app = workflow.compile()