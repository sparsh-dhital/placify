"""Explainable candidate-to-job matching."""

from typing import Any, Iterable


def _skills(value: Any) -> set[str]:
	if isinstance(value, str):
		value = value.replace(";", ",").split(",")
	return {str(item).strip().casefold() for item in (value or []) if str(item).strip()}


def match_candidates(job: dict[str, Any], students: Iterable[dict[str, Any]]) -> dict[str, Any]:
	required = _skills(job.get("required_skills", job.get("mandatory_skills", [])))
	preferred = _skills(job.get("preferred_skills", []))
	matches = []
	for student in students:
		available = _skills(student.get("skills", student.get("student_skills", [])))
		matched_required, matched_preferred = required & available, preferred & available
		missing = (required | preferred) - available
		required_score = len(matched_required) / len(required) if required else 1
		preferred_score = len(matched_preferred) / len(preferred) if preferred else 1
		score = round(required_score * 70 + preferred_score * 30)
		missing_required = required - available
		matches.append({
			"student_id": str(student.get("student_id", student.get("id", ""))),
			"student_name": student.get("student_name", student.get("name", "Unknown student")),
			"match_score": score,
			"matched_skills": sorted(matched_required | matched_preferred),
			"missing_skills": sorted(missing),
			"explanation": "Strong alignment with the role." if not missing_required else f"Missing mandatory skills: {', '.join(sorted(missing_required))}.",
			"confidence": "high" if score >= 80 else "medium" if score >= 55 else "low",
		})
	matches.sort(key=lambda item: (-item["match_score"], item["student_name"]))
	return {"success": True, "agent": "Matchmaker Agent", "job_id": str(job.get("job_id", job.get("id", ""))), "job": job.get("role", job.get("job", "")), "company": job.get("company", ""), "candidates_analyzed": len(matches), "matches": matches}


class MatchmakerAgent:
	def match(self, job: dict[str, Any], students: Iterable[dict[str, Any]]) -> dict[str, Any]:
		return match_candidates(job, students)


generate_matches = match_candidates
