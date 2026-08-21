import re

from app.models.pydantic_schemas import StudentProfile


def parse_profile(text: str, student_id: str) -> StudentProfile:
    normalized_text = re.sub(r"\s+", " ", text).strip()
    lines = [line.strip(" -|•\t") for line in text.splitlines() if line.strip()]
    name = _extract_name(lines)
    cgpa_match = re.search(
        r"(?:cgpa|cumulative\s+gpa|gpa)\s*(?:is|:|=|-)?\s*(\d+(?:\.\d+)?)\s*(?:/\s*10|out\s+of\s+10)?",
        normalized_text,
        re.I,
    )
    branch_match = re.search(r"\b(CSE|IT|ECE|EEE|ME|CIVIL|BTECH|B\.TECH)\b", text, re.I)
    roll_match = re.search(r"(?:roll\s*(?:no|number)?|student\s*id)\s*[:=-]?\s*([A-Za-z0-9-]+)", text, re.I)
    skill_names = (
        "Python", "Java", "JavaScript", "TypeScript", "React", "Angular", "Node.js",
        "SQL", "PostgreSQL", "MySQL", "Git", "Docker", "Kubernetes", "AWS", "Azure",
        "Pandas", "NumPy", "TensorFlow", "PyTorch", "Machine Learning", "Deep Learning",
        "Spring Boot", "Django", "Flask", "FastAPI", "REST API", "C++", "C#", "HTML", "CSS",
    )
    skills = [skill for skill in skill_names if re.search(rf"(?<![\w+#]){re.escape(skill)}(?![\w+#])", normalized_text, re.I)]
    project_lines = [line for line in lines if re.search(r"project|system|application|dashboard|portal", line, re.I)]
    backlog_match = re.search(r"(?:backlogs?|arrears?)\s*(?:is|:|=|-)?\s*(\d+)", normalized_text, re.I)
    return StudentProfile(
        id=student_id,
        name=name,
        roll_no=roll_match.group(1) if roll_match else "",
        branch=branch_match.group(1).upper() if branch_match else "",
        cgpa=float(cgpa_match.group(1)) if cgpa_match else 0,
        skills=skills,
        projects=project_lines[:20],
        backlogs=int(backlog_match.group(1)) if backlog_match else 0,
    )


def _extract_name(lines: list[str]) -> str:
        for line in lines[:5]:
            if re.search(r"(?:resume|curriculum vitae|cv|email|phone|contact|linkedin|github)", line, re.I):
                continue
            if re.fullmatch(r"[A-Za-z][A-Za-z .'-]{2,80}", line):
                return line[:120]
        return lines[0][:120] if lines else "Unknown Student"
