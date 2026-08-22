"""Small in-memory repository used by the local demo backend."""

STUDENTS = [
	{"student_id": "s1", "name": "Aarav Mehta", "branch": "CSE", "cgpa": 8.7, "backlogs": 0, "skills": ["Python", "SQL", "Git", "React"]},
	{"student_id": "s2", "name": "Ananya Sharma", "branch": "CSE", "cgpa": 9.1, "backlogs": 0, "skills": ["Python", "SQL", "Git"]},
	{"student_id": "s3", "name": "Rahul Khanna", "branch": "CSE", "cgpa": 7.8, "backlogs": 1, "skills": ["React", "Git"]},
	{"student_id": "s4", "name": "Vikram Singh", "branch": "ECE", "cgpa": 6.9, "backlogs": 0, "skills": ["Java", "SQL"]},
]

JOBS = {
	"20000000-0000-0000-0000-000000000001": {
		"job_id": "20000000-0000-0000-0000-000000000001",
		"company": "TechNova Solutions", "role": "Software Engineer",
		"min_cgpa": 7.5, "max_backlogs": 0,
		"required_skills": ["Python", "SQL", "Git"], "preferred_skills": ["React", "Docker"],
	}
}

PANELS = [{"id": "p1", "name": "Technical Panel A"}, {"id": "p2", "name": "Technical Panel B"}]
ROOMS = [{"id": "r1", "name": "Room 101"}, {"id": "r2", "name": "Room 102"}]
FEEDBACK = []
