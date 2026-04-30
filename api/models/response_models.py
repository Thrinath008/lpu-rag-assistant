# ============================================================
# Project : LPU RAG Knowledge Assistant
# Authors : Thrinath, Shambhavi, Arshad
# Year    : 2026
# Module  : response_models.py
# ============================================================
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
try:
    from scripts._watermark import _stamp
    _stamp("response_models")
except ImportError:
    pass # Ignore for now if not found

from pydantic import BaseModel
from typing import Dict, List, Any

class HealthResponse(BaseModel):
    status: str
    model: str
    vector_db: str
    total_chunks: int
    embedding_model: str
    author: str
    version: str
    year: str

class StatsResponse(BaseModel):
    total_documents: int
    total_chunks: int
    categories: int
    embedding_model: str
    vector_db: str
    llm_model: str
