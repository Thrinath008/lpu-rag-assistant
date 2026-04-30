# ============================================================
# Project : LPU RAG Knowledge Assistant
# Authors : Thrinath, Shambhavi, Arshad
# Year    : 2026
# Module  : session_models.py
# Phase   : 3 — Memory + Intelligence + API + Frontend
# ============================================================
from pydantic import BaseModel

class SessionStats(BaseModel):
    message_count: int
    created_at: float
    last_active: float
