def match_student(student: dict, job: dict, skills: set[str]) -> dict:
    required = [str(item) for item in job.get("required_skills") or []]
    preferred = [str(item) for item in job.get("preferred_skills") or []]
    normalized = {item.lower() for item in skills}
    matched_required = [item for item in required if item.lower() in normalized]
    matched_preferred = [item for item in preferred if item.lower() in normalized]
    missing = [item for item in required + preferred if item.lower() not in normalized]
    total = len(required) * 2 + len(preferred)
    score = round(((len(matched_required) * 2 + len(matched_preferred)) / total) * 100) if total else 0
    return {"student_id": str(student["id"]), "student_name": student.get("name", "Unknown"), "match_score": score, "matched_skills": matched_required + matched_preferred, "missing_skills": missing, "explanation": f"Matched {len(matched_required)} of {len(required)} mandatory and {len(matched_preferred)} of {len(preferred)} preferred skills.", "confidence": "high" if score >= 80 else "medium" if score >= 60 else "low"}
