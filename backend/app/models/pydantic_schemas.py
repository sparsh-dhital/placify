from typing import Literal

from pydantic import BaseModel, Field


class RequirementResult(BaseModel):
	requirement: str
	met: bool


class FailureReason(BaseModel):
	code: str
	message: str
	recommendation: str


class JDAnalysisResponse(BaseModel):
	success: bool = True
	job_id: str | None = None
	company: str
	role: str
	min_cgpa: float = Field(default=0, ge=0, le=10)
	max_backlogs: int = Field(default=0, ge=0)
	salary: str = ""
	location: str = ""
	eligible_branches: list[str] = []
	required_skills: list[str] = []
	preferred_skills: list[str] = []
	ai_confidence: int = Field(default=90, ge=0, le=100)
	raw_text: str = ""


class JDAnalyzeRequest(BaseModel):
	text: str = Field(min_length=1)
	company: str | None = None
	role: str | None = None


class JobCreateRequest(BaseModel):
	company: str = Field(min_length=1, max_length=200)
	role: str = Field(min_length=1, max_length=200)
	description: str = Field(min_length=20)
	location: str = ""
	salary: str = ""
	min_cgpa: float | None = Field(default=None, ge=0, le=10)
	max_backlogs: int | None = Field(default=None, ge=0)
	eligible_branches: list[str] = []


class EligibilityRequest(BaseModel):
	job_id: str


class JobRequest(BaseModel):
	job_id: str


class ShortlistDecision(BaseModel):
	student_id: str
	action: Literal["approve", "reject"]
	override_reason: str | None = None


class ShortlistRequest(BaseModel):
	job_id: str
	decisions: list[ShortlistDecision]


class StudentProfile(BaseModel):
	id: str
	name: str
	roll_no: str = ""
	branch: str = ""
	cgpa: float = 0
	backlogs: int = 0
	graduation_year: int | None = None
	skills: list[str] = []
	projects: list[str] = []


class EligibilityResult(BaseModel):
	student_id: str
	student_name: str
	cgpa: float
	backlogs: int
	eligible: bool
	status: str
	reasons: list[str] = []
	failure_reasons: list[FailureReason] = []
	fastest_path_to_eligibility: list[str] = []


class EligibilityResponse(BaseModel):
	success: bool = True
	agent: str = "Eligibility Agent"
	job_id: str
	job: str
	company: str
	total_students: int
	eligible_students: int
	ineligible_students: int
	results: list[EligibilityResult]


class ResumeUploadResponse(BaseModel):
	success: bool = True
	student_id: str
	resume_id: str
	profile: StudentProfile
	resume_text: str
	skills_saved: int


class FeedbackRequest(BaseModel):
	interview_id: str
	technical_score: int = Field(ge=0, le=5)
	communication_score: int = Field(ge=0, le=5)
	problem_solving_score: int = Field(ge=0, le=5)
	overall_result: Literal["pass", "fail", "hold", ""]
	comments: str = ""
