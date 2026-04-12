# ============================================================
# Project : LPU RAG Knowledge Assistant
# Author  : Thrinath
# Year    : 2026
# Module  : auth.py - Authentication Routes
# ============================================================

import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthCredentials
from datetime import timedelta
from pydantic import BaseModel, EmailStr

from api.core.auth import (
    authenticate_user,
    create_access_token,
    verify_token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    User,
)
from api.core.config import settings

router = APIRouter()
security = HTTPBearer()

# ============================================================
# Request/Response Models
# ============================================================

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict

class AuthResponse(BaseModel):
    status: str
    message: str

# ============================================================
# Dependency: Get Current User
# ============================================================

async def get_current_user(credentials: HTTPAuthCredentials = Depends(security)) -> User:
    """Extract and verify the current user from JWT token."""
    token = credentials.credentials
    
    payload = verify_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    email = payload.get("email")
    if email is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )
    
    # You could fetch the full user here, but for now we return minimal info
    return User(id=1, email=email, is_admin=True)

async def get_admin_user(current_user: User = Depends(get_current_user)) -> User:
    """Ensure the current user is an admin."""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user

# ============================================================
# Routes
# ============================================================

@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest):
    """
    Admin login endpoint.
    Returns JWT token for authenticated users.
    """
    user = authenticate_user(request.email, request.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    
    if not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account does not have admin privileges",
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=access_token_expires
    )
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user={
            "id": user.id,
            "email": user.email,
            "is_admin": user.is_admin,
        }
    )

@router.post("/logout", response_model=AuthResponse)
async def logout(current_user: User = Depends(get_current_user)):
    """
    Logout endpoint.
    Client should discard the token on their end.
    """
    return AuthResponse(
        status="success",
        message="Logged out successfully"
    )

@router.get("/me")
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information."""
    return {
        "id": current_user.id,
        "email": current_user.email,
        "is_admin": current_user.is_admin,
    }
