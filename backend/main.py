from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from services.ai_agent import get_interview_prep, InterviewPlan

app = FastAPI(title="Campus AI Placement Agent")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "Baseline API is running", "message": "Ready for Hackathon"}

# Our new AI Agent Endpoint
@app.get("/api/prep", response_model=InterviewPlan)
def generate_prep(major: str, role: str):
    return get_interview_prep(major, role)