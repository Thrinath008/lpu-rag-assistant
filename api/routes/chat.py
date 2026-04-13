# ============================================================
# Project : LPU RAG Knowledge Assistant
# Author  : Thrinath
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

router = APIRouter()

class ChatRequest(BaseModel):
    query: str
    history: Optional[List[Dict[str, str]]] = []

class Source(BaseModel):
    text: str
    source_file: str
    category: str
    chunk_index: int
    token_count: int
    score: float

class ChatResponse(BaseModel):
    answer: str
    sources: List[Source]
    author_sig: str
    integrity: str

def verify_api_key(x_api_key: str = Header(None)):
    if not x_api_key or x_api_key != settings.API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API Key")
    return x_api_key

@router.post("/ask", response_model=ChatResponse)
def ask_question(request: ChatRequest, api_key: str = Header(None, alias="x-api-key")):
    try:
        result = ask_rag(request.query, request.history)
        return ChatResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ask/stream")
async def ask_question_stream(request: ChatRequest, x_api_key: str = Header(None)):
    if not x_api_key or x_api_key != settings.API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API Key")
    
    return StreamingResponse(
        stream_rag(request.query),
        media_type="application/x-ndjson"
    )
