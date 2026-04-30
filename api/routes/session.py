# ============================================================
# Project : LPU RAG Knowledge Assistant
# Authors : Thrinath, Shambhavi, irshad
# Year    : 2026
# Module  : session.py
# Phase   : 3 — Memory + Intelligence + API + Frontend
# ============================================================
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
try:
    from scripts._watermark import _stamp
    _MODULE_STAMP = _stamp("session_routes")
except ImportError:
    pass

from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

from api.core.config import settings
from api.services.memory_service import memory_service
from api.models.session_models import SessionStats

router = APIRouter()

def verify_api_key(x_api_key: str = Header(None)):
    if not x_api_key or x_api_key != settings.API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API Key")
    return x_api_key

@router.post("/sessions/create")
def create_session(api_key: str = Depends(verify_api_key)):
    session_id = memory_service.create_session()
    return {"session_id": session_id, "status": "created"}

@router.get("/sessions/{session_id}/history")
def get_session_history(session_id: str, api_key: str = Depends(verify_api_key)):
    if not memory_service.session_exists(session_id):
        raise HTTPException(status_code=404, detail="Session not found or expired")
    history = memory_service.get_history(session_id)
    return {"session_id": session_id, "history": history}

@router.delete("/sessions/{session_id}")
def clear_session(session_id: str, api_key: str = Depends(verify_api_key)):
    if not memory_service.session_exists(session_id):
        raise HTTPException(status_code=404, detail="Session not found or expired")
    memory_service.clear_session(session_id)
    return {"session_id": session_id, "status": "cleared"}

@router.get("/sessions/{session_id}/stats", response_model=SessionStats)
def get_session_stats(session_id: str, api_key: str = Depends(verify_api_key)):
    if not memory_service.session_exists(session_id):
        raise HTTPException(status_code=404, detail="Session not found or expired")
    stats = memory_service.get_session_stats(session_id)
    return SessionStats(**stats)
