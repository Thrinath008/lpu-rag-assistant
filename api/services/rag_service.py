# ============================================================
# Project : LPU RAG Knowledge Assistant
# Authors : Thrinath, Shambhavi, Arshad
# Year    : 2026
# Module  : rag_service.py
# Phase   : 3 — Memory + Intelligence + API + Frontend
# ============================================================
import sys
import os
import json
import datetime
import logging
from typing import Dict, Any, Generator

try:
    from scripts._watermark import _stamp
    _MODULE_STAMP = _stamp("rag_service")
except ImportError:
    pass

import chromadb

from api.core.config import settings
from api.prompts.system_prompt import SYSTEM_PROMPT

from api.services.memory_service import memory_service
from api.services.rewriter_service import rewriter_service
from api.services.classifier_service import classifier_service
from api.services.confidence_service import confidence_service
from api.services.llm_service import llm_service

logger = logging.getLogger(__name__)

# Initialize ChromaDB client lazily
_chroma_client = None
_collection = None

def get_chroma_collection():
    global _chroma_client, _collection
    if not _chroma_client:
        try:
            _chroma_client = chromadb.PersistentClient(path=settings.CHROMA_DIR)
            _collection = _chroma_client.get_collection(name=settings.COLLECTION_NAME)
        except Exception as e:
            logger.error(f"Failed to get ChromaDB collection: {e}")
            _collection = None
    return _collection

def retrieve_chunks(query: str, category_filter: dict = None) -> list:
    """Retrieves context chunks from Vector DB."""
    collection = get_chroma_collection()
    if not collection:
        return []

    try:
        results = collection.query(
            query_texts=[query],
            n_results=settings.TOP_K,
            where=category_filter
        )
        
        chunks = []
        if results and results.get("documents") and results["documents"][0]:
            for i, doc in enumerate(results["documents"][0]):
                metadata = results["metadatas"][0][i]
                distance = results["distances"][0][i]
                # Convert L2 distance to similarity score
                similarity = max(0.0, 1 - (distance / 2))
                
                chunks.append({
                    "text": doc,
                    "source_file": metadata.get("source_file", "unknown"),
                    "category": metadata.get("category", "unknown"),
                    "chunk_index": metadata.get("chunk_index", 0),
                    "score": similarity
                })
        
        return chunks
    except Exception as e:
        logger.error(f"Error retrieving from ChromaDB: {e}")
        return []

def format_sources_for_ui(chunks: list) -> list:
    sources = []
    for c in chunks:
        sources.append({
            "text": c["text"][:200],
            "source_file": c["source_file"],
            "category": c["category"],
            "chunk_index": c["chunk_index"],
            "token_count": len(c["text"].split()),
            "score": c["score"]
        })
    return sources

def ask_rag(query: str, session_id: str) -> Dict[str, Any]:
    """
    Executes the full Phase 3 RAG Pipeline.
    """
    try:
        # 1. Load session history
        history = memory_service.get_history(session_id)
        
        # 2. Rewrite query
        rewritten_query = rewriter_service.rewrite(query=query, history=history)
        
        # 3. Classify
        category = classifier_service.classify(query=rewritten_query)
        cat_filter = classifier_service.get_category_filter(category=category)
        
        # 4. Retrieve
        chunks = retrieve_chunks(query=rewritten_query, category_filter=cat_filter)
        
        # 5. Score Results
        confidence_data = confidence_service.score(chunks=chunks, category=category)
        
        # 6. Off-topic handling
        # Only block if it matched a category but had zero relation.
        # Natively general/greeting queries don't hit off topic logic aggressively.
        if category != "general" and confidence_service.is_off_topic(chunks=chunks):
            answer = confidence_data["message"]
            sources = []
        else:
            # 7. Build context string
            context_string = ""
            if chunks and not confidence_service.is_off_topic(chunks=chunks):
                context_string = "\n\n".join([f"[{c['source_file']}] {c['text']}" for c in chunks])
            
            # 8. Call LLM Wrapper
            answer = llm_service.generate(
                system_prompt=SYSTEM_PROMPT,
                history=history,
                context=context_string,
                query=query
            )
            
            # Only send sources if LLM actively parsed metadata and confidence was above LOW
            sources = format_sources_for_ui(chunks)
            if ("Source" not in answer and "source" not in answer) or confidence_data["level"] == "LOW":
                sources = []
        
        # 9. Save Interaction to Memory
        memory_service.add_message(session_id=session_id, role="user", content=query)
        memory_service.add_message(session_id=session_id, role="assistant", content=answer)
        
        # 10. Return full dict
        return {
            "answer": answer,
            "sources": sources,
            "original_query": query,
            "rewritten_query": rewritten_query,
            "category": category,
            "confidence": confidence_data,
            "session_id": session_id,
            "model": settings.GROQ_MODEL,
            "author": "LPU Assistant v3.0",
            "timestamp": datetime.datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in ask_rag: {e}", exc_info=True)
        return {
            "answer": f"System error processing request: {str(e)}",
            "sources": [],
            "original_query": query,
            "rewritten_query": query,
            "category": "error",
            "confidence": confidence_service.score([], "none"),
            "session_id": session_id,
            "model": settings.GROQ_MODEL,
            "author": "LPU Assistant v3.0",
            "timestamp": datetime.datetime.now().isoformat()
        }

def stream_rag(query: str, session_id: str) -> Generator[str, None, None]:
    """Streaming is deprecated temporarily to enforce robust memory orchestration checks. Using ask_rag natively."""
    yield json.dumps({"error": "Streaming disabled in Phase 3. Use standard /ask endpoint."}) + "\n"
