# ============================================================
# Project : LPU RAG Knowledge Assistant
# Author  : Thrinath
# Year    : 2026
# Module  : auth.py - Authentication & JWT Handling
# ============================================================

import os
import sqlite3
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
import json
import hashlib

# JWT Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "lpu-secret-key-2026-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 hours

# Password hashing - Using argon2 instead of bcrypt for Python 3.13 compatibility
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

# Database path
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "auth.db")

# ============================================================
# Pydantic Models
# ============================================================

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

class LoginRequest(BaseModel):
    email: str
    password: str

class User(BaseModel):
    id: int
    email: str
    is_admin: bool

# ============================================================
# Database Setup
# ============================================================

def init_db():
    """Initialize the SQLite database with users table."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            is_admin BOOLEAN DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create default admin user if not exists
    cursor.execute('SELECT * FROM users WHERE email = ?', ('saragadathrinath@gmail.com',))
    if not cursor.fetchone():
        hashed_password = pwd_context.hash("Sthrinath@1234")
        cursor.execute('''
            INSERT INTO users (email, password_hash, is_admin)
            VALUES (?, ?, ?)
        ''', ('saragadathrinath@gmail.com', hashed_password, 1))
    
    conn.commit()
    conn.close()

# Initialize on import
init_db()

# ============================================================
# Password Functions
# ============================================================

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash a password."""
    return pwd_context.hash(password)

# ============================================================
# JWT Functions
# ============================================================

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Optional[dict]:
    """Verify and decode a JWT token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            return None
        return {"email": email}
    except JWTError:
        return None

# ============================================================
# User Database Functions
# ============================================================

def authenticate_user(email: str, password: str) -> Optional[User]:
    """Authenticate user with email and password."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('SELECT id, email, password_hash, is_admin FROM users WHERE email = ?', (email,))
    user_record = cursor.fetchone()
    conn.close()
    
    if not user_record:
        return None
    
    id, email, password_hash, is_admin = user_record
    
    if not verify_password(password, password_hash):
        return None
    
    return User(id=id, email=email, is_admin=bool(is_admin))

def get_user_by_email(email: str) -> Optional[User]:
    """Get user by email."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('SELECT id, email, is_admin FROM users WHERE email = ?', (email,))
    user_record = cursor.fetchone()
    conn.close()
    
    if not user_record:
        return None
    
    id, email, is_admin = user_record
    return User(id=id, email=email, is_admin=bool(is_admin))

def create_user(email: str, password: str, is_admin: bool = False) -> Optional[User]:
    """Create a new user."""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        hashed_password = get_password_hash(password)
        cursor.execute('''
            INSERT INTO users (email, password_hash, is_admin)
            VALUES (?, ?, ?)
        ''', (email, hashed_password, 1 if is_admin else 0))
        
        conn.commit()
        user_id = cursor.lastrowid
        conn.close()
        
        return User(id=user_id, email=email, is_admin=is_admin)
    except sqlite3.IntegrityError:
        return None

# ============================================================
# Password Functions
# ============================================================

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash a password."""
    return pwd_context.hash(password)

# ============================================================
# JWT Functions
# ============================================================

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Optional[dict]:
    """Verify and decode a JWT token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            return None
        return {"email": email}
    except JWTError:
        return None

# ============================================================
# User Database Functions
# ============================================================

def authenticate_user(email: str, password: str) -> Optional[User]:
    """Authenticate user with email and password."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('SELECT id, email, password_hash, is_admin FROM users WHERE email = ?', (email,))
    user_record = cursor.fetchone()
    conn.close()
    
    if not user_record:
        return None
    
    id, email, password_hash, is_admin = user_record
    
    if not verify_password(password, password_hash):
        return None
    
    return User(id=id, email=email, is_admin=bool(is_admin))

def get_user_by_email(email: str) -> Optional[User]:
    """Get user by email."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('SELECT id, email, is_admin FROM users WHERE email = ?', (email,))
    user_record = cursor.fetchone()
    conn.close()
    
    if not user_record:
        return None
    
    id, email, is_admin = user_record
    return User(id=id, email=email, is_admin=bool(is_admin))

def create_user(email: str, password: str, is_admin: bool = False) -> Optional[User]:
    """Create a new user."""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        hashed_password = get_password_hash(password)
        cursor.execute('''
            INSERT INTO users (email, password_hash, is_admin)
            VALUES (?, ?, ?)
        ''', (email, hashed_password, 1 if is_admin else 0))
        
        conn.commit()
        user_id = cursor.lastrowid
        conn.close()
        
        return User(id=user_id, email=email, is_admin=is_admin)
    except sqlite3.IntegrityError:
        return None
