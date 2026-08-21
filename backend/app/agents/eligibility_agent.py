from app.models.pydantic_schemas import EligibilityResult, FailureReason


def evaluate_student(student: dict, job: dict, skills: set[str]) -> EligibilityResult:
    reasons: list[str] = []
    failures: list[FailureReason] = []
    path: list[str] = []
    cgpa = float(student.get("cgpa") or 0)
    backlogs = int(student.get("backlogs", student.get("backlog_count", 0)) or 0)
    minimum = float(job.get("min_cgpa") or 0)
    maximum = int(job.get("max_backlogs") or 0)
    branches = {value.lower() for value in (job.get("eligible_branches") or [])}
    branch = str(student.get("branch") or "")
    if cgpa < minimum:
        message = f"CGPA {cgpa:g} is below minimum required {minimum:g}"
        reasons.append(message)
        failures.append(FailureReason(code="cgpa", message=message, recommendation="Improve CGPA before the next placement drive."))
        path.append("Improve CGPA to meet the job threshold")
    if backlogs > maximum:
        message = f"Backlogs {backlogs} exceed maximum allowed {maximum}"
        reasons.append(message)
        failures.append(FailureReason(code="backlogs", message=message, recommendation="Clear active backlogs before applying."))
        path.append("Clear active backlogs")
    if branches and branch.lower() not in branches:
        message = f"Branch {branch} is not eligible for this job"
        reasons.append(message)
        failures.append(FailureReason(code="branch", message=message, recommendation="Apply to roles that accept your branch."))
        path.append("Find a drive that accepts your branch")
    student_skills = {skill.lower() for skill in skills}
    for skill in job.get("required_skills") or []:
        if skill.lower() not in student_skills:
            message = f"Missing mandatory skill: {skill}"
            reasons.append(message)
            failures.append(FailureReason(code="skill", message=message, recommendation=f"Complete a {skill} certification or build a project using {skill}."))
            path.append(f"Complete a {skill} certification or build a project using {skill}")
    return EligibilityResult(
        student_id=str(student["id"]), student_name=student.get("name", "Unknown"), cgpa=cgpa,
        backlogs=backlogs, eligible=not failures, status="Eligible" if not failures else "Ineligible",
        reasons=reasons, failure_reasons=failures, fastest_path_to_eligibility=path,
    )
