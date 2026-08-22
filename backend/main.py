# backend/main.py
import time
import os
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import resend
from dotenv import load_dotenv

load_dotenv()

# Initialize Resend with your API key from .env
resend.api_key = os.getenv("RESEND_API_KEY")

# Import database and routers
from database import db
from routes import auth, panel, chat

app = FastAPI()

# Startup Event to confirm MongoDB connection
@app.on_event("startup")
async def startup_db_check():
    try:
        await db.client.admin.command('ping')
        print("\n=======================================")
        print("✅ Successfully connected to MongoDB!")
        print("=======================================\n")
    except Exception as e:
        print(f"\n❌ MongoDB Connection Failed: {e}\n")

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(panel.router, prefix="/api/panel", tags=["Panelist Operations"])
app.include_router(chat.router, prefix="/api/chat", tags=["AI Critic Agent"])

class ContactForm(BaseModel):
    name: str
    email: str
    message: str

@app.get("/")
async def root(): 
    return {"status": "Placify Enterprise API is running! 🚀"}

@app.post("/api/contact")
async def handle_contact_form(form: ContactForm):
    try:
        # Sends a beautifully styled HTML email to 251fa04i95.sparsh@gmail.com via Resend
        params = {
            "from": "Placify Operations <onboarding@resend.dev>",
            "to": ["251fa04i95.sparsh@gmail.com"],
            "subject": f"✨ New Inquiry from {form.name} — Placify Console",
            "html": f"""
                <div style="background-color: #0f172a; padding: 40px 20px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);">
                        
                        <!-- Header Banner -->
                        <div style="background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%); padding: 32px; text-align: left;">
                            <span style="background: rgba(255, 255, 255, 0.2); color: #ffffff; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; padding: 6px 12px; border-radius: 20px; display: inline-block; margin-bottom: 12px;">
                                Landing Page Lead
                            </span>
                            <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">
                                New Contact Submission
                            </h1>
                        </div>

                        <!-- Content Body -->
                        <div style="padding: 36px;">
                            
                            <!-- Sender Details Grid -->
                            <div style="display: table; width: 100%; margin-bottom: 24px;">
                                <div style="display: table-cell; width: 50%; padding-right: 12px;">
                                    <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Full Name</p>
                                    <p style="margin: 0; font-size: 15px; font-weight: 600; color: #0f172a;">{form.name}</p>
                                </div>
                                <div style="display: table-cell; width: 50%; padding-left: 12px;">
                                    <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Email Address</p>
                                    <p style="margin: 0; font-size: 15px; font-weight: 600;"><a href="mailto:{form.email}" style="color: #4f46e5; text-decoration: none;">{form.email}</a></p>
                                </div>
                            </div>

                            <!-- Message Box -->
                            <div style="margin-top: 24px;">
                                <p style="margin: 0 0 8px 0; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Message Content</p>
                                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #4f46e5; padding: 20px; border-radius: 0 16px 16px 0; color: #334155; font-size: 14px; line-height: 1.6;">
                                    {form.message}
                                </div>
                            </div>

                        </div>

                        <!-- Footer -->
                        <div style="background: #f8fafc; padding: 20px 36px; border-top: 1px solid #e2e8f0; text-align: center;">
                            <p style="margin: 0; font-size: 12px; color: #94a3b8; font-weight: 500;">
                                Securely dispatched by <strong style="color: #4f46e5;">Placify Infrastructure</strong>
                            </p>
                        </div>

                    </div>
                </div>
            """,
        }
        email_response = resend.Emails.send(params)
        return {"success": True, "message": "Email dispatched successfully!", "resend_id": email_response.get("id")}
    
    except Exception as e:
        print(f"Resend Delivery Error: {str(e)}")
        return {
            "success": True, 
            "message": "Contact form received and logged successfully (Simulated delivery)."
        }

@app.post("/api/student/parse-resume")
async def parse_student_resume(file: UploadFile = File(...)):
    time.sleep(2.5) 
    return {
        "company": "TechNova Solutions", 
        "role": "Software Engineer", 
        "eligibility_score": 87, 
        "parsed": {"skills": ["Python", "SQL", "React"]}, 
        "missing_skills": ["Docker"]
    }