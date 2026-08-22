# backend/main.py
import time
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Import your newly structured router
from routes import auth

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Authentication Routes
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])

class ContactForm(BaseModel):
    name: str; email: str; message: str

@app.get("/")
async def root(): 
    return {"status": "Placify API (Structured) is running! 🚀"}

# Keeping your other non-auth endpoints here for now
@app.post("/api/contact")
async def handle_contact_form(form: ContactForm):
    return {"success": True, "message": "Contact endpoint connected."}

@app.post("/api/student/parse-resume")
async def parse_student_resume(file: UploadFile = File(...)):
    time.sleep(2.5) 
    return {"company": "TechNova", "role": "Engineer", "eligibility_score": 87, "parsed": {"skills": ["Python"]}, "missing_skills": ["Docker"]}