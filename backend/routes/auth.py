# backend/routes/auth.py
import os
import random
import httpx
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from passlib.context import CryptContext
import jwt

from database import db

router = APIRouter()

JWT_SECRET = os.getenv("JWT_SECRET", "super_secret_dev_key")
JWT_ALGORITHM = "HS256"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# --- Models ---
class LoginRequest(BaseModel):
    email: str
    password: str

class SignupRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str

class VerifySignupRequest(SignupRequest):
    otp: str

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    email: str
    otp: str
    new_password: str

class OAuthCallbackRequest(BaseModel):
    code: str
    provider: str
    role: str

# --- Helpers ---
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    to_encode.update({"exp": datetime.utcnow() + timedelta(minutes=1440)})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

# --- Routes ---
@router.post("/login")
async def login(request: LoginRequest):
    user = await db.users.find_one({"email": request.email})
    if not user or not verify_password(request.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    token = create_access_token({
        "sub": str(user["_id"]), 
        "email": user["email"], 
        "role": user["role"],
        "name": user.get("name", "User")
    })
    return {"access_token": token, "user": {"name": user.get("name"), "email": user["email"], "role": user["role"]}}

@router.post("/signup/request-otp")
async def request_signup_otp(request: ForgotPasswordRequest):
    user = await db.users.find_one({"email": request.email})
    if user:
        raise HTTPException(status_code=400, detail="Account with this email already exists.")
    
    otp_code = str(random.randint(100000, 999999))
    expires_at = datetime.utcnow() + timedelta(minutes=10)
    
    await db.otps.update_one(
        {"email": request.email}, 
        {"$set": {"otp": otp_code, "expires_at": expires_at}}, 
        upsert=True
    )
    
    print(f"\n=======================================")
    print(f"[OTP KEY] SIGNUP OTP FOR {request.email}: {otp_code}")
    print(f"=======================================\n")
    
    return {"success": True, "message": "Verification code sent.", "mock_otp": otp_code}

@router.post("/signup/verify")
async def verify_signup(request: VerifySignupRequest):
    otp_record = await db.otps.find_one({"email": request.email, "otp": request.otp})
    
    if not otp_record or datetime.utcnow() > otp_record["expires_at"]:
        raise HTTPException(status_code=400, detail="Invalid or expired verification code.")
        
    new_user = {
        "name": request.name,
        "email": request.email,
        "password": get_password_hash(request.password),
        "role": request.role,
        "created_at": datetime.utcnow()
    }
    
    result = await db.users.insert_one(new_user)
    user_id = str(result.inserted_id)

    if request.role == "student":
        await db.db["students"].insert_one({
            "student_id": user_id, "name": request.name, "email": request.email,
            "branch": "CSE", "cgpa": 0.0, "skills": [], "shortlist_status": "pending"
        })
    elif request.role == "panelist":
        await db.db["panels"].insert_one({
            "panel_id": user_id, "name": request.name, "email": request.email
        })

    await db.otps.delete_one({"email": request.email}) 
    
    token = create_access_token({"sub": user_id, "email": request.email, "role": request.role, "name": request.name})
    return {"access_token": token, "user": {"name": request.name, "email": request.email, "role": request.role}}

@router.post("/oauth/callback")
async def oauth_callback(request: OAuthCallbackRequest):
    email, name = None, None

    async with httpx.AsyncClient() as client:
        if request.provider == "google":
            token_res = await client.post("https://oauth2.googleapis.com/token", data={
                "client_id": os.getenv("GOOGLE_CLIENT_ID"),
                "client_secret": os.getenv("GOOGLE_CLIENT_SECRET"),
                "code": request.code,
                "grant_type": "authorization_code",
                "redirect_uri": "http://localhost:5173/login"
            })
            token_data = token_res.json()
            if "access_token" not in token_data:
                raise HTTPException(status_code=400, detail="Google Authentication Failed")

            user_res = await client.get(
                "https://www.googleapis.com/oauth2/v3/userinfo", 
                headers={"Authorization": f"Bearer {token_data['access_token']}"}
            )
            user_data = user_res.json()
            email = user_data.get("email")
            name = user_data.get("name")

        elif request.provider == "github":
            token_res = await client.post("https://github.com/login/oauth/access_token", data={
                "client_id": os.getenv("GITHUB_CLIENT_ID"),
                "client_secret": os.getenv("GITHUB_CLIENT_SECRET"),
                "code": request.code,
                "redirect_uri": "http://localhost:5173/login"
            }, headers={"Accept": "application/json"})
            token_data = token_res.json()
            
            if "access_token" not in token_data:
                raise HTTPException(status_code=400, detail="GitHub Authentication Failed")

            headers = {"Authorization": f"Bearer {token_data['access_token']}"}
            user_res = await client.get("https://api.github.com/user", headers=headers)
            user_data = user_res.json()
            name = user_data.get("name") or user_data.get("login")

            # Fetch user email securely from GitHub API endpoints
            email_res = await client.get("https://api.github.com/user/emails", headers=headers)
            if email_res.status_code == 200:
                emails = email_res.json()
                primary_email = next((e["email"] for e in emails if e.get("primary")), None)
                email = primary_email or (emails[0]["email"] if emails else None)
            
            if not email:
                email = user_data.get("email")
        else:
            raise HTTPException(status_code=400, detail="Unsupported provider.")

    if not email:
        raise HTTPException(status_code=400, detail="Could not retrieve email from provider.")

    # Check MongoDB for existing user, auto-seed if new
    user = await db.users.find_one({"email": email})
    if not user:
        new_user = {
            "name": name or "GitHub User",
            "email": email,
            "password": get_password_hash(os.urandom(16).hex()),
            "role": request.role,
            "created_at": datetime.utcnow(),
            "provider": request.provider
        }
        result = await db.users.insert_one(new_user)
        user_id = str(result.inserted_id)

        if request.role == "student":
            await db.db["students"].insert_one({
                "student_id": user_id, "name": new_user["name"], "email": email,
                "branch": "CSE", "cgpa": 0.0, "skills": [], "shortlist_status": "pending"
            })
        elif request.role == "panelist":
            await db.db["panels"].insert_one({
                "panel_id": user_id, "name": new_user["name"], "email": email
            })
    else:
        user_id = str(user["_id"])
        name = user.get("name", name)
        request.role = user.get("role", request.role)

    token = create_access_token({
        "sub": user_id, "email": email, "role": request.role, "name": name
    })
    return {"access_token": token, "user": {"name": name, "email": email, "role": request.role}}

@router.post("/forgot-password/request-otp")
async def forgot_password_otp(request: ForgotPasswordRequest):
    user = await db.users.find_one({"email": request.email})
    if not user:
        raise HTTPException(status_code=404, detail="No account found with this email.")
    
    otp_code = str(random.randint(100000, 999999))
    expires_at = datetime.utcnow() + timedelta(minutes=10)
    
    await db.otps.update_one({"email": request.email}, {"$set": {"otp": otp_code, "expires_at": expires_at}}, upsert=True)
    return {"success": True, "message": "Reset code sent.", "mock_otp": otp_code}

@router.post("/forgot-password/reset")
async def reset_password(request: ResetPasswordRequest):
    otp_record = await db.otps.find_one({"email": request.email, "otp": request.otp})
    if not otp_record or datetime.utcnow() > otp_record["expires_at"]:
        raise HTTPException(status_code=400, detail="Invalid or expired reset code.")
        
    await db.users.update_one({"email": request.email}, {"$set": {"password": get_password_hash(request.new_password)}})
    await db.otps.delete_one({"email": request.email}) 
    return {"success": True, "message": "Password successfully reset."}

@router.post("/seed")
async def seed_users():
    existing = await db.users.find_one({"email": "student@placify.com"})
    if existing: return {"message": "Test users already exist!"}
    
    test_users = [
        {"name": "Demo Student", "email": "student@placify.com", "password": get_password_hash("password123"), "role": "student"},
        {"name": "Demo Admin", "email": "admin@placify.com", "password": get_password_hash("password123"), "role": "admin"},
        {"name": "Demo Panelist", "email": "panelist@placify.com", "password": get_password_hash("password123"), "role": "panelist"}
    ]
    await db.users.insert_many(test_users)
    return {"message": "[SUCCESS] Created test accounts!"}