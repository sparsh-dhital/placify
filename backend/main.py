# main.py
import os
import time
from datetime import datetime, timedelta
from fastapi import FastAPI, HTTPException, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import resend
from dotenv import load_dotenv

from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
import jwt

# 1. Load Environment Variables
load_dotenv()

app = FastAPI()

# 2. Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Configs
resend.api_key = os.getenv("RESEND_API_KEY")
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
JWT_SECRET = os.getenv("JWT_SECRET", "super_secret_dev_key")
JWT_ALGORITHM = "HS256"

# Password Hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=1440) # 24 hrs
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)


# --- DATABASE CONNECTION LIFECYCLE ---
db_client = None
db = None

@app.on_event("startup")
async def startup_db_client():
    global db_client, db
    try:
        db_client = AsyncIOMotorClient(MONGO_URI)
        db = db_client.placify_db
        print("✅ Successfully connected to MongoDB!")
    except Exception as e:
        print(f"❌ Failed to connect to MongoDB: {e}")

@app.on_event("shutdown")
async def shutdown_db_client():
    if db_client:
        db_client.close()


# --- DATA MODELS ---
class ContactForm(BaseModel):
    name: str
    email: str
    message: str

class LoginRequest(BaseModel):
    email: str
    password: str


# ==========================================
# ENDPOINT: Root Health Check
# ==========================================
@app.get("/")
async def root():
    return {"status": "Placify Backend + MongoDB is running smoothly! 🚀"}


# ==========================================
# ENDPOINT: Authentication (Login)
# ==========================================
@app.post("/api/auth/login")
async def login(request: LoginRequest):
    user = await db.users.find_one({"email": request.email})
    
    if not user or not verify_password(request.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token_payload = {
        "sub": str(user["_id"]),
        "email": user["email"],
        "role": user["role"]
    }
    
    return {
        "access_token": create_access_token(token_payload),
        "user": {
            "name": user["name"],
            "email": user["email"],
            "role": user["role"]
        }
    }


# ==========================================
# ENDPOINT: Seed Test Users 
# ==========================================
@app.post("/api/auth/seed")
async def seed_users():
    users_collection = db.users
    existing = await users_collection.find_one({"email": "student@placify.com"})
    if existing:
        return {"message": "Test users already exist in Compass!"}

    test_users = [
        {"name": "Demo Student", "email": "student@placify.com", "password": get_password_hash("password123"), "role": "student"},
        {"name": "Demo Admin", "email": "admin@placify.com", "password": get_password_hash("password123"), "role": "admin"},
        {"name": "Demo Panelist", "email": "panelist@placify.com", "password": get_password_hash("password123"), "role": "panelist"}
    ]
    
    await users_collection.insert_many(test_users)
    return {"message": "✅ Created test Student, Admin, and Panelist accounts! Check MongoDB Compass."}


# ==========================================
# ENDPOINT: Contact Form Integration (RESTORED STYLING)
# ==========================================
@app.post("/api/contact")
async def handle_contact_form(form: ContactForm):
    if not resend.api_key:
        raise HTTPException(status_code=500, detail="API key is missing")

    try:
        email_response = resend.Emails.send({
            "from": "onboarding@resend.dev", 
            "to": ["251fa04i95.sparsh@gmail.com"],
            "subject": f"Placify Enterprise: Inquiry from {form.name}",
            "reply_to": form.email,
            "html": f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta name="color-scheme" content="light dark">
                <meta name="supported-color-schemes" content="light dark">
                <style>
                    :root {{
                        color-scheme: light dark;
                    }}
                    @media (prefers-color-scheme: dark) {{
                        .body-bg {{ background-color: #05050A !important; }}
                        .card-bg {{ background-color: #0A0A12 !important; border-color: #1E293B !important; }}
                        .text-primary {{ color: #F8FAFC !important; }}
                        .text-secondary {{ color: #94A3B8 !important; }}
                        .badge-bg {{ background-color: #1a1c36 !important; border-color: #2d2f55 !important; color: #818CF8 !important; }}
                        .message-box {{ background-color: #0F172A !important; border-left-color: #6366F1 !important; color: #CBD5E1 !important; }}
                        .border-line {{ border-color: #1E293B !important; }}
                        .footer-text {{ color: #475569 !important; }}
                    }}
                </style>
            </head>
            <body class="body-bg" style="margin: 0; padding: 0; background-color: #F1F5F9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                <table width="100%" cellpadding="0" cellspacing="0" class="body-bg" style="background-color: #F1F5F9; padding: 40px 20px;">
                    <tr>
                        <td align="center">
                            <!-- Main Container Card -->
                            <table width="100%" class="card-bg" style="max-width: 600px; background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);" cellpadding="0" cellspacing="0">
                                
                                <!-- Header Section -->
                                <tr>
                                    <td align="center" class="border-line" style="padding: 36px 32px 28px 32px; border-bottom: 1px solid #E2E8F0;">
                                        <h1 class="text-primary" style="margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; color: #0F172A;">
                                            Placify<span style="color: #4F46E5;">.</span>
                                        </h1>
                                        <table cellpadding="0" cellspacing="0" style="margin-top: 14px;">
                                            <tr>
                                                <td class="badge-bg" style="background-color: #EEF2FF; border: 1px solid #C7D2FE; border-radius: 9999px; padding: 5px 14px;">
                                                    <span style="font-size: 11px; font-weight: 700; color: #4F46E5; letter-spacing: 0.5px; text-transform: uppercase;">
                                                        Enterprise Concierge
                                                    </span>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>

                                <!-- Content Body -->
                                <tr>
                                    <td style="padding: 36px 32px;">
                                        <h2 class="text-primary" style="margin: 0 0 24px 0; font-size: 18px; font-weight: 600; color: #1E293B;">
                                            New Integration Request Received
                                        </h2>

                                        <!-- Submitter Information Table -->
                                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 28px;">
                                            <tr>
                                                <td width="90" style="padding-bottom: 14px; vertical-align: top;">
                                                    <span class="text-secondary" style="font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.8px;">Sender</span>
                                                </td>
                                                <td style="padding-bottom: 14px; vertical-align: top;">
                                                    <span class="text-primary" style="font-size: 15px; color: #0F172A; font-weight: 600;">{form.name}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td width="90" style="padding-bottom: 14px; vertical-align: top;">
                                                    <span class="text-secondary" style="font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.8px;">Email</span>
                                                </td>
                                                <td style="padding-bottom: 14px; vertical-align: top;">
                                                    <a href="mailto:{form.email}" style="font-size: 15px; color: #2563EB; text-decoration: none; font-weight: 500;">{form.email}</a>
                                                </td>
                                            </tr>
                                        </table>

                                        <!-- Message Section -->
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="padding-bottom: 10px;">
                                                    <span class="text-secondary" style="font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.8px;">Message Details</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td class="message-box" style="background-color: #F8FAFC; border-left: 4px solid #4F46E5; border-radius: 6px; padding: 20px;">
                                                    <p class="text-primary" style="margin: 0; color: #334155; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">{form.message}</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>

                                <!-- Footer Section -->
                                <tr>
                                    <td align="center" class="border-line body-bg" style="padding: 24px 32px; background-color: #F8FAFC; border-top: 1px solid #E2E8F0;">
                                        <p class="footer-text" style="margin: 0; font-size: 12px; font-weight: 500; color: #64748B;">System Notification • Placify AI Engine v2.0</p>
                                        <p class="footer-text" style="margin: 6px 0 0 0; font-size: 11px; color: #94A3B8;">Direct reply routed securely to sender's address.</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
            """
        })
        return {"success": True, "message": "Email delivered successfully"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==========================================
# ENDPOINT: AI Resume Diagnostics
# ==========================================
@app.post("/api/student/parse-resume")
async def parse_student_resume(file: UploadFile = File(...)):
    try:
        content = await file.read()
        time.sleep(2.5) 
        return {
            "company": "TechNova Solutions",
            "role": "Software Engineer",
            "eligibility_score": 87,
            "parsed": {"skills": ["Python", "React", "Node.js", "SQL", "Git"]},
            "missing_skills": ["Docker", "AWS"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))