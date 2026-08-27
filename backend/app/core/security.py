# backend/app/core/security.py
import os
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

JWT_SECRET = os.getenv("JWT_SECRET", "super_secret_dev_key")
JWT_ALGORITHM = "HS256"

# Tells FastAPI to expect a Bearer token in the Authorization header
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials. Please log in again.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        role: str = payload.get("role")
        email: str = payload.get("email")
        
        if user_id is None or role is None:
            raise credentials_exception
            
        return {"id": user_id, "role": role, "email": email}
    except jwt.PyJWTError:
        raise credentials_exception

# --- Role-Based Dependency Generators ---
def require_role(required_role: str):
    async def role_checker(user: dict = Depends(get_current_user)):
        if user.get("role") != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Unauthorized. This action requires the '{required_role}' role."
            )
        return user
    return role_checker

# Dependency variables to inject into routes
get_current_admin = require_role("admin")
get_current_student = require_role("student")
get_current_panelist = require_role("panelist")