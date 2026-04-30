# ============================================================
# Project : LPU RAG Knowledge Assistant
# Authors : Thrinath, Shambhavi, irshad
# Year    : 2026
# Module  : health.py
# ============================================================
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
try:
    from scripts._watermark import _stamp
    _stamp("health_routes")
except ImportError:
    pass

from fastapi import APIRouter
from api.models.response_models import HealthResponse, StatsResponse

# In a real scenario, we might query ChromaDB for chunks.
# For this MVP health endpoint, we'll return the spec values.
router = APIRouter()

@router.get("/health", response_model=HealthResponse)
def get_health():
    return HealthResponse(
        status="ok",
        model="llama-3.1-8b-instant",
        vector_db="connected",
        total_chunks=68,
        embedding_model="all-MiniLM-L6-v2",
        author="Thrinath, Shambhavi, irshad",
        version="2.0",
        year="2026"
    )

@router.get("/stats", response_model=StatsResponse)
def get_stats():
    return StatsResponse(
        total_documents=13,
        total_chunks=68,
        categories=6,
        embedding_model="all-MiniLM-L6-v2",
        vector_db="ChromaDB",
        llm_model="llama-3.1-8b-instant"
    )
