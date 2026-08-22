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

class LoginRequest(BaseModel):
    email: str
    password: str

class OTPRequest(BaseModel):
    email: str

class OTPVerify(BaseModel):
    email: str
    otp: str

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    to_encode.update({"exp": datetime.utcnow() + timedelta(minutes=1440)})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

@router.post("/login")
async def login(request: LoginRequest):
    user = await db.users.find_one({"email": request.email})
    if not user or not verify_password(request.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": str(user["_id"]), "email": user["email"], "role": user["role"]})
    return {"access_token": token, "user": {"name": user["name"], "email": user["email"], "role": user["role"]}}

@router.post("/request-otp")
async def request_otp(request: OTPRequest):
    user = await db.users.find_one({"email": request.email})
    if not user:
        raise HTTPException(status_code=404, detail="Account not found.")
    
    otp_code = str(random.randint(100000, 999999))
    expires_at = datetime.utcnow() + timedelta(minutes=10)
    
    await db.otps.update_one(
        {"email": request.email}, 
        {"$set": {"otp": otp_code, "expires_at": expires_at}}, 
        upsert=True
    )
    
    print(f"\n=======================================")
    print(f"🔑 MOCKED OTP FOR {request.email}: {otp_code}")
    print(f"=======================================\n")
    
    return {"success": True, "message": "OTP Generated", "mock_otp": otp_code}

@router.post("/verify-otp")
async def verify_otp(request: OTPVerify):
    otp_record = await db.otps.find_one({"email": request.email, "otp": request.otp})
    
    if not otp_record:
        raise HTTPException(status_code=401, detail="Invalid OTP code.")
    if datetime.utcnow() > otp_record["expires_at"]:
        raise HTTPException(status_code=401, detail="OTP has expired.")
        
    user = await db.users.find_one({"email": request.email})
    await db.otps.delete_one({"email": request.email}) 
    
    token = create_access_token({"sub": str(user["_id"]), "email": user["email"], "role": user["role"]})
    return {"access_token": token, "user": {"name": user["name"], "email": user["email"], "role": user["role"]}}

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
    return {"message": "✅ Created test accounts!"}