from typing import Any

from pydantic import BaseModel, Field


class JDAnalyzeRequest(BaseModel):
	text: str = Field(min_length=1)


class JobRequest(BaseModel):
	job_id: str


class ShortlistRequest(JobRequest):
	decisions: list[dict[str, Any]] = []


class FeedbackRequest(BaseModel):
	interview_id: str
	technical_score: int = Field(ge=0, le=5)
	communication_score: int = Field(ge=0, le=5)
	problem_solving_score: int = Field(ge=0, le=5)
	overall_result: str
	comments: str = ""
