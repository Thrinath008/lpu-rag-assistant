# ============================================================
# Project : LPU RAG Knowledge Assistant
# Authors : Thrinath, Shambhavi, Arshad
# Year    : 2026
# Module  : admin_models.py
# Phase   : 3 — Memory + Intelligence + API + Frontend
# ============================================================
from pydantic import BaseModel

class ProcessResponse(BaseModel):
    status: str
    message: str
    chunks_created: int
    category: str
