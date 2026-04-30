# ============================================================
# Project : LPU RAG Knowledge Assistant
# Authors : Thrinath, Shambhavi, Arshad
# Year    : 2026
# Module  : chat_models.py
# Phase   : 3 — Memory + Intelligence + API + Frontend
# ============================================================
from pydantic import BaseModel
from typing import List, Optional
from api.core.config import settings

class ChatRequest(BaseModel):
    query: str
    session_id: Optional[str] = None
    top_k: int = settings.TOP_K

class ConfidenceResult(BaseModel):
    level: str
    label: str
    best_score: float
    avg_score: float
    strong_chunks: int
    message: str
    color: str

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
    original_query: str
    rewritten_query: str
    category: str
    confidence: ConfidenceResult
    session_id: str
    model: str
    author: str
    timestamp: str
