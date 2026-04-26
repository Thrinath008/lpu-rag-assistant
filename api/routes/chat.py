# ============================================================
# Project : LPU RAG Knowledge Assistant
# Authors : Thrinath, Shambhavi, Arshad
# Year    : 2026
# Module  : chat.py
# ============================================================
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
try:
    from scripts._watermark import _stamp
    _stamp("chat_routes")
except ImportError:
    pass

from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

from fastapi.responses import StreamingResponse
from api.core.config import settings
from api.services.rag_service import ask_rag, stream_rag
from api.models.chat_models import ChatRequest, ChatResponse, ConfidenceResult, Source

router = APIRouter()

def verify_api_key(x_api_key: str = Header(None)):
    if not x_api_key or x_api_key != settings.API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API Key")
    return x_api_key

from api.services.memory_service import memory_service

@router.post("/ask", response_model=ChatResponse)
def ask_question(request: ChatRequest, api_key: str = Depends(verify_api_key)):
    try:
        session_id = request.session_id
        if not session_id or not memory_service.session_exists(session_id):
            session_id = memory_service.create_session()
            
        result = ask_rag(query=request.query, session_id=session_id)
        return ChatResponse(**result)
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ask/stream")
async def ask_question_stream(request: ChatRequest, api_key: str = Depends(verify_api_key)):
    session_id = request.session_id
    if not session_id or not memory_service.session_exists(session_id):
        session_id = memory_service.create_session()
        
    return StreamingResponse(
        stream_rag(request.query, session_id),
        media_type="application/x-ndjson"
    )
