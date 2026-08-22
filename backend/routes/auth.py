# backend/routes/auth.py
import os
import random
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

    token = create_access_token({"sub": str(user["_id"]), "email": user["email"], "role": user["role"]})
    return {"access_token": token, "user": {"name": user["name"], "email": user["email"], "role": user["role"]}}

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
        
    # Create the user only after OTP is validated
    new_user = {
        "name": request.name,
        "email": request.email,
        "password": get_password_hash(request.password),
        "role": request.role,
        "created_at": datetime.utcnow()
    }
    
    result = await db.users.insert_one(new_user)
    await db.otps.delete_one({"email": request.email}) 
    
    token = create_access_token({"sub": str(result.inserted_id), "email": request.email, "role": request.role})
    return {"access_token": token, "user": {"name": request.name, "email": request.email, "role": request.role}}

@router.post("/forgot-password/request-otp")
async def forgot_password_otp(request: ForgotPasswordRequest):
    user = await db.users.find_one({"email": request.email})
    if not user:
        raise HTTPException(status_code=404, detail="No account found with this email.")
    
    otp_code = str(random.randint(100000, 999999))
    expires_at = datetime.utcnow() + timedelta(minutes=10)
    
    await db.otps.update_one(
        {"email": request.email}, 
        {"$set": {"otp": otp_code, "expires_at": expires_at}}, 
        upsert=True
    )
    
    print(f"\n=======================================")
    print(f"[OTP KEY] PASSWORD RESET OTP FOR {request.email}: {otp_code}")
    print(f"=======================================\n")
    
    return {"success": True, "message": "Reset code sent.", "mock_otp": otp_code}

@router.post("/forgot-password/reset")
async def reset_password(request: ResetPasswordRequest):
    otp_record = await db.otps.find_one({"email": request.email, "otp": request.otp})
    
    if not otp_record or datetime.utcnow() > otp_record["expires_at"]:
        raise HTTPException(status_code=400, detail="Invalid or expired reset code.")
        
    await db.users.update_one(
        {"email": request.email}, 
        {"$set": {"password": get_password_hash(request.new_password)}}
    )
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