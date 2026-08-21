def calculate_match(student_skills, job_skills):
    """
    Deterministic Matchmaker Agent.

    Compares student skills with job requirements
    and produces an explainable match score.
    """

    student_skill_names = {
        skill["skill_name"].strip().lower()
        for skill in student_skills
    }

    mandatory_skills = {
        skill["skill_name"].strip().lower()
        for skill in job_skills
        if skill["skill_type"] == "mandatory"
    }

    preferred_skills = {
        skill["skill_name"].strip().lower()
        for skill in job_skills
        if skill["skill_type"] == "preferred"
    }

    all_job_skills = mandatory_skills | preferred_skills

    matched_skills = sorted(
        student_skill_names & all_job_skills
    )

    missing_skills = sorted(
        all_job_skills - student_skill_names
    )

    # Mandatory skills are more important
    mandatory_matched = student_skill_names & mandatory_skills
    preferred_matched = student_skill_names & preferred_skills

    mandatory_score = (
        len(mandatory_matched) / len(mandatory_skills) * 70
        if mandatory_skills
        else 70
    )

    preferred_score = (
        len(preferred_matched) / len(preferred_skills) * 30
        if preferred_skills
        else 30
    )

    match_score = round(
        mandatory_score + preferred_score,
        2
    )

    if match_score >= 80:
        confidence = "high"
    elif match_score >= 60:
        confidence = "medium"
    else:
        confidence = "low"

    if matched_skills:
        matched_text = ", ".join(
            skill.title() for skill in matched_skills
        )
    else:
        matched_text = "none"

    if missing_skills:
        missing_text = ", ".join(
            skill.title() for skill in missing_skills
        )
    else:
        missing_text = "none"

    explanation = (
        f"Candidate matches {len(matched_skills)} "
        f"of {len(all_job_skills)} required/preferred skills. "
        f"Matched skills: {matched_text}. "
        f"Missing skills: {missing_text}."
    )

    return {
        "match_score": match_score,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "match_explanation": explanation,
        "confidence": confidence
    }