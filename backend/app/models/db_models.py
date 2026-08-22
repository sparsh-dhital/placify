"""Portable domain models for the local demo repository.

These dataclasses keep the API usable without requiring a database service.
They can be mapped to SQLAlchemy or Supabase records later without changing
the agent contracts.
"""

from dataclasses import dataclass, field
from typing import Optional


@dataclass
class Student:
	student_id: str
	name: str
	branch: str
	cgpa: float
	backlogs: int = 0
	skills: list[str] = field(default_factory=list)
	graduation_year: Optional[int] = None


@dataclass
class Job:
	job_id: str
	company: str
	role: str
	min_cgpa: float = 0
	max_backlogs: int = 0
	required_skills: list[str] = field(default_factory=list)
	preferred_skills: list[str] = field(default_factory=list)


@dataclass
class Interview:
	interview_id: str
	student_id: str
	panel_id: str
	room_id: str
	start_time: str
	end_time: str
	status: str = "proposed"
