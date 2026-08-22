"""Deterministic job-description extraction for the placement workflow."""

import re
from typing import Any

SKILL_CATALOG = {
	"python": "Python", "java": "Java", "javascript": "JavaScript",
	"typescript": "TypeScript", "react": "React", "sql": "SQL",
	"postgresql": "PostgreSQL", "mysql": "MySQL", "git": "Git",
	"docker": "Docker", "kubernetes": "Kubernetes", "aws": "AWS",
	"azure": "Azure", "machine learning": "Machine Learning",
	"data analysis": "Data Analysis",
}


def _capture(patterns: list[str], text: str, default: str = "") -> str:
	for pattern in patterns:
		match = re.search(pattern, text, re.IGNORECASE)
		if match:
			return match.group(1).strip(" .,:;\n")
	return default


def _number(patterns: list[str], text: str, default: float | int) -> float | int:
	value = _capture(patterns, text)
	try:
		parsed = float(value)
		return int(parsed) if parsed.is_integer() else parsed
	except (TypeError, ValueError):
		return default


def analyze_job_description(text: str) -> dict[str, Any]:
	"""Return a reviewable MVP extraction without requiring an LLM."""
	if not isinstance(text, str) or not text.strip():
		raise ValueError("Job description text is required")
	normalized = re.sub(r"\s+", " ", text).strip()
	company = _capture(
		[r"(?:company|organization)\s*[:\-]\s*([^\n|,]+)",
		 r"^([A-Z][\w& .-]{2,50})\s+(?:is hiring|is looking)"],
		text, "Unknown company",
	)
	role = _capture(
		[r"(?:role|position|job title)\s*[:\-]\s*([^\n|,]+)",
		 r"hiring\s+(?:a|an)?\s*([A-Za-z][\w /-]{2,60})"],
		text, "Unspecified role",
	)
	detected = [label for key, label in SKILL_CATALOG.items()
				if re.search(rf"\b{re.escape(key)}\b", normalized, re.IGNORECASE)]
	preferred_text = " ".join(re.findall(
		r"(?:preferred|nice to have|good to have)\s*[:\-]?\s*([^.;\n]+)",
		text, re.IGNORECASE,
	))
	preferred = [skill for skill in detected if re.search(
		rf"\b{re.escape(skill)}\b", preferred_text, re.IGNORECASE)]
	return {
		"success": True, "company": company, "role": role,
		"location": _capture([r"(?:location|based in)\s*[:\-]?\s*([^,.;\n]+)"], text),
		"min_cgpa": _number([r"(?:cgpa|gpa)[^\d]{0,20}(\d+(?:\.\d+)?)",
							  r"(\d+(?:\.\d+)?)\s*\+?\s*cgpa"], text, 0),
		"max_backlogs": int(_number([
			r"(?:maximum|max|up to|allowed)[^\d]{0,20}(\d+)\s*(?:active\s*)?backlogs?"
		], text, 0)),
		"salary": _capture([r"(?:salary|package|ctc)\s*[:\-]?\s*([^.;\n]+)"], text),
		"required_skills": [skill for skill in detected if skill not in preferred],
		"preferred_skills": preferred, "ai_confidence": 85,
	}


class JDAgent:
	def analyze(self, text: str) -> dict[str, Any]:
		return analyze_job_description(text)


analyze_jd = analyze_job_description
