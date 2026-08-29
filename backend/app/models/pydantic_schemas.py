# app/models/pydantic_schemas.py
from typing import Any, Optional, List
from pydantic import BaseModel, Field


class JDAnalyzeRequest(BaseModel):
    text: str = Field(min_length=1)


class JobRequest(BaseModel):
    job_id: str


class ShortlistDecision(BaseModel):
    student_id: str
    action: str  # "approve" or "reject"
    override_reason: Optional[str] = None


class ShortlistRequest(JobRequest):
    decisions: List[ShortlistDecision] = []


class FeedbackRequest(BaseModel):
    interview_id: str
    technical_score: int = Field(ge=1, le=10)
    communication_score: int = Field(ge=1, le=10)
    problem_solving_score: int = Field(ge=1, le=10)
    overall_result: str
    comments: str = ""