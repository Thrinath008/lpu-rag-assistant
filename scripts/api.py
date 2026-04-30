# ============================================================
# Project : LPU RAG Knowledge Assistant
# Authors : Thrinath, Shambhavi, irshad
# Module  : api.py
# Signature: T-RAG-LPU-2026-TEAM
# ============================================================
# This code is the work of Thrinath, Shambhavi, and irshad.
# Built as part of the LPU RAG Knowledge Assistant project.
# Unauthorized use, copying, or redistribution is prohibited.
# Integrity token: 5468726e617468 (hex encoded author name)
# ============================================================

import sys
import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from contextlib import asynccontextmanager

sys.path.insert(0, os.path.dirname(__file__))
from _watermark import _stamp, _get_signature, _AUTHOR_FULL
import rag_query

# Silent integrity verification on every run
_MODULE_STAMP = _stamp("api")


@asynccontextmanager
async def lifespan(app: FastAPI):
    print(f"✅ FastAPI Server starting...")
    print(f"🔐 System: {_get_signature()}")
    yield
    print("🛑 FastAPI Server shutting down...")


app = FastAPI(
    title="LPU RAG Knowledge Assistant API",
    version="1.0",
    lifespan=lifespan
)


class QueryRequest(BaseModel):
    query: str


@app.get("/health")
async def health_check():
    return {
        "status": "ok", 
        "model": rag_query.GROQ_MODEL
    }


@app.get("/stats")
async def get_stats():
    # Fetch dynamically from the collection to be accurate
    try:
        total_chunks = rag_query.collection.count()
    except Exception:
        total_chunks = 68  # Fallback to known default

    return {
        "total_chunks": total_chunks,
        "total_docs": 13,
        "categories": 6
    }


@app.post("/ask")
async def ask_question(request: QueryRequest):
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
        
    try:
        # Step 1: Retrieve chunks
        chunks = rag_query.retrieve_chunks(request.query)
        
        # Step 2: Build context
        context = rag_query.build_context(chunks)
        
        # Step 3: Generate answer using Groq
        answer_data = rag_query.generate_answer(request.query, context)
        
        # Extract unique source files referenced
        sources = list(set([c["source_file"] for c in chunks]))
        
        # Verify integrity securely
        integrity_status = "verified" if _MODULE_STAMP["integrity"] else "failed"
        
        return {
            "answer": answer_data["answer"],
            "sources": sources,
            "chunks": len(chunks),
            "author": _AUTHOR_FULL,
            "integrity": integrity_status
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    # Run the server via uvicorn if executed directly
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
