def check_student_eligibility(student, job):
    """
    Deterministic Eligibility Agent.

    Checks hard requirements:
    - Minimum CGPA
    - Maximum allowed backlogs
    """

    reasons = []
    eligible = True

    cgpa = float(student.get("cgpa", 0))
    backlogs = int(student.get("backlog_count", 0))

    min_cgpa = float(job.get("min_cgpa") or 0)
    max_backlogs = int(job.get("max_backlogs") or 0)

    # CGPA check
    if cgpa < min_cgpa:
        eligible = False
        reasons.append(
            f"CGPA {cgpa} is below minimum required {min_cgpa}"
        )
    else:
        reasons.append(
            f"CGPA {cgpa} meets minimum requirement {min_cgpa}"
        )

    # Backlog check
    if backlogs > max_backlogs:
        eligible = False
        reasons.append(
            f"{backlogs} active backlog(s), maximum allowed is {max_backlogs}"
        )
    else:
        reasons.append(
            f"Backlogs {backlogs} are within allowed limit {max_backlogs}"
        )

    return {
        "student_id": student["id"],
        "student_name": student["name"],
        "eligible": eligible,
        "status": "eligible" if eligible else "ineligible",
        "reasons": reasons
    }