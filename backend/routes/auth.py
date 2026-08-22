# backend/routes/auth.py
import os
import random
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from passlib.context import CryptContext
import jwt

# Import the database instance from database.py
from database import db

router = APIRouter()

# Authentication Configs
JWT_SECRET = os.getenv("JWT_SECRET", "super_secret_dev_key")
JWT_ALGORITHM = "HS256"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Models
class LoginRequest(BaseModel):
    email: str
    password: str

class OTPRequest(BaseModel):
    email: str

class OTPVerify(BaseModel):
    email: str
    otp: str

# Helpers
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    to_encode.update({"exp": datetime.utcnow() + timedelta(minutes=1440)})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)


# ==========================================
# ENDPOINT: Password Login (RESTORED)
# ==========================================
@router.post("/login")
async def login(request: LoginRequest):
    user = await db.users.find_one({"email": request.email})
    
    if not user or not verify_password(request.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": str(user["_id"]), "email": user["email"], "role": user["role"]})
    return {"access_token": token, "user": {"name": user["name"], "email": user["email"], "role": user["role"]}}


# ==========================================
# ENDPOINT: Request Mocked OTP
# ==========================================
@router.post("/request-otp")
async def request_otp(request: OTPRequest):
    user = await db.users.find_one({"email": request.email})
    if not user:
        raise HTTPException(status_code=404, detail="Account not found. Please verify your email.")
    
    # Generate 6-digit code
    otp_code = str(random.randint(100000, 999999))
    expires_at = datetime.utcnow() + timedelta(minutes=10)
    
    # Save to database
    await db.otps.update_one(
        {"email": request.email}, 
        {"$set": {"otp": otp_code, "expires_at": expires_at}}, 
        upsert=True
    )
    
    # Print to terminal for debugging
    print(f"\n=======================================")
    print(f"🔑 MOCKED OTP FOR {request.email}: {otp_code}")
    print(f"=======================================\n")
    
    # Return mock OTP to frontend so it can auto-fill during your demo
    return {"success": True, "message": "OTP Generated", "mock_otp": otp_code}


# ==========================================
# ENDPOINT: Verify OTP
# ==========================================
@router.post("/verify-otp")
async def verify_otp(request: OTPVerify):
    otp_record = await db.otps.find_one({"email": request.email, "otp": request.otp})
    
    if not otp_record:
        raise HTTPException(status_code=401, detail="Invalid OTP code.")
    if datetime.utcnow() > otp_record["expires_at"]:
        raise HTTPException(status_code=401, detail="OTP has expired.")
        
    user = await db.users.find_one({"email": request.email})
    await db.otps.delete_one({"email": request.email}) # Cleanup used OTP
    
    token = create_access_token({"sub": str(user["_id"]), "email": user["email"], "role": user["role"]})
    return {"access_token": token, "user": {"name": user["name"], "email": user["email"], "role": user["role"]}}