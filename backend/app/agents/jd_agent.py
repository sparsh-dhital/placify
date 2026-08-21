import re

from app.models.pydantic_schemas import JDAnalysisResponse

KNOWN_SKILLS = ["python", "java", "javascript", "typescript", "react", "sql", "postgresql", "git", "docker", "aws", "machine learning", "pandas", "c++", "fastapi"]


def _skills(text: str) -> list[str]:
	return [skill.title() for skill in KNOWN_SKILLS if re.search(rf"\b{re.escape(skill)}\b", text, re.I)]


def analyze_jd(text: str, company: str | None = None, role: str | None = None) -> JDAnalysisResponse:
	if not text.strip():
		raise ValueError("Job description cannot be empty")
	cgpa = re.search(r"(?:cgpa|gpa)\s*(?:of|above|minimum|required|>=|>|:)?\s*(\d+(?:\.\d+)?)", text, re.I)
	backlogs = re.search(r"(?:backlogs?|arrears?)\s*(?:of|<=|=|:)?\s*(\d+)", text, re.I)
	company_match = re.search(r"([A-Z][\w &.-]+?)\s+(?:is hiring|hiring)", text)
	role_match = re.search(r"(?:for|role of|position of)\s+([A-Za-z][\w /-]+)", text, re.I)
	branches = [branch.upper() for branch in ("CSE", "IT", "ECE", "EEE", "ME", "CIVIL") if re.search(rf"\b{branch}\b", text, re.I)]
	all_skills = _skills(text)
	preferred = [skill for skill in all_skills if re.search(rf"{re.escape(skill)}\s*(?:is\s*)?(?:preferred|optional|nice to have|good to have)", text, re.I)]
	required = [skill for skill in all_skills if skill not in preferred]
	preferred_set = set(preferred)
	return JDAnalysisResponse(company=company or (company_match.group(1).strip() if company_match else "Unknown Company"), role=role or (role_match.group(1).strip() if role_match else "Software Engineer"), min_cgpa=float(cgpa.group(1)) if cgpa else 0, max_backlogs=int(backlogs.group(1)) if backlogs else 0, eligible_branches=branches, required_skills=[skill for skill in required if skill not in preferred_set], preferred_skills=preferred, raw_text=text)
