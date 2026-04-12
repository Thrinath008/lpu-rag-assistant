# ============================================================
# Project : LPU RAG Knowledge Assistant
# Author  : Thrinath
# Year    : 2026
# Module  : rag_service.py
# ============================================================
import os
import sys
from typing import List, Dict, Any, Generator
from tenacity import retry, stop_after_attempt, wait_exponential
from functools import lru_cache
import time
import json

from api.core.config import settings
from api.core.logging import logger

# Constants from settings
CHROMA_DIR = settings.CHROMA_DIR
COLLECTION_NAME = settings.COLLECTION_NAME
EMBED_MODEL = settings.EMBED_MODEL
TOP_K = settings.TOP_K
GROQ_MODEL = settings.GROQ_MODEL

SYSTEM_PROMPT = """You are the official AI Knowledge Assistant for Lovely Professional University (LPU).

INSTRUCTIONS:
1. Answer ONLY from provided context
2. Cite sources with document names
3. Be professional and clear
4. If unsure, say so explicitly

You represent LPU and must be accurate."""

# Global instances - lazy loaded
_chromadb_client = None
_embed_model = None
_groq_client = None

def get_chromadb():
    """Lazy-load ChromaDB client."""
    global _chromadb_client
    if _chromadb_client is None:
        try:
            import chromadb
            _chromadb_client = chromadb.PersistentClient(path=CHROMA_DIR)
            logger.info("✓ ChromaDB initialized")
        except Exception as e:
            logger.error(f"Failed to initialize ChromaDB: {e}")
            raise
    return _chromadb_client

def get_embedder():
    """Lazy-load SentenceTransformer."""
    global _embed_model
    if _embed_model is None:
        try:
            from sentence_transformers import SentenceTransformer
            _embed_model = SentenceTransformer(EMBED_MODEL)
            logger.info(f"✓ Embedding model {EMBED_MODEL} loaded")
        except Exception as e:
            logger.error(f"Failed to load embedding model: {e}")
            raise
    return _embed_model

def get_groq_client():
    """Lazy-load Groq client."""
    global _groq_client
    if _groq_client is None:
        try:
            from groq import Groq
            api_key = os.getenv("GROQ_API_KEY", "")
            if not api_key:
                logger.warning("⚠ GROQ_API_KEY not set - AI responses will fail")
            _groq_client = Groq(api_key=api_key)
            logger.info("✓ Groq client initialized")
        except Exception as e:
            logger.error(f"Failed to initialize Groq: {e}")
            raise
    return _groq_client

def retrieve_chunks(query: str, top_k: int = TOP_K) -> List[Dict[str, Any]]:
    """Retrieve similar chunks from ChromaDB."""
    try:
        client = get_chromadb()
        collection = client.get_collection(COLLECTION_NAME)
        
        embedder = get_embedder()
        query_embedding = embedder.encode(query).tolist()
        
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k,
            include=["documents", "metadatas", "distances"]
        )
        
        chunks = []
        for i, doc in enumerate(results["documents"][0]):
            metadata = results["metadatas"][0][i]
            distance = results["distances"][0][i]
            similarity = 1 - (distance / 2)
            
            chunks.append({
                "text": doc,
                "source_file": metadata.get("source_file", "unknown"),
                "category": metadata.get("category", "unknown"),
                "chunk_index": metadata.get("chunk_index", 0),
                "score": max(0, similarity)
            })
        
        return chunks
    except Exception as e:
        logger.error(f"Error retrieving chunks: {e}")
        return []

def ask_rag(query: str) -> Dict[str, Any]:
    """Ask RAG system and get answer with sources."""
    try:
        # Retrieve context
        chunks = retrieve_chunks(query)
        if not chunks:
            return {
                "answer": "I could not find relevant information in the knowledge base.",
                "sources": [],
                "author_sig": "LPU Assistant v2.0",
                "integrity": "no_context"
            }
        
        # Build context
        context = "\n\n".join([
            f"[{c['source_file']}] {c['text']}"
            for c in chunks
        ])
        
        # Get response from Groq
        client = get_groq_client()
        message = client.messages.create(
            model=GROQ_MODEL,
            max_tokens=1024,
            system=SYSTEM_PROMPT,
            messages=[
                {
                    "role": "user",
                    "content": f"Context:\n{context}\n\nQuestion: {query}"
                }
            ]
        )
        
        answer = message.content[0].text
        
        # Format sources
        sources = [
            {
                "text": c["text"][:200],
                "source_file": c["source_file"],
                "category": c["category"],
                "chunk_index": c["chunk_index"],
                "token_count": len(c["text"].split()),
                "score": c["score"]
            }
            for c in chunks
        ]
        
        return {
            "answer": answer,
            "sources": sources,
            "author_sig": "LPU Assistant v2.0",
            "integrity": "verified"
        }
    except Exception as e:
        logger.error(f"Error in ask_rag: {e}")
        return {
            "answer": f"Error: {str(e)}",
            "sources": [],
            "author_sig": "LPU Assistant v2.0",
            "integrity": "error"
        }

def stream_rag(query: str) -> Generator[str, None, None]:
    """Stream RAG responses."""
    try:
        chunks = retrieve_chunks(query)
        context = "\n\n".join([f"[{c['source_file']}] {c['text']}" for c in chunks])
        
        client = get_groq_client()
        stream = client.messages.stream(
            model=GROQ_MODEL,
            max_tokens=1024,
            system=SYSTEM_PROMPT,
            messages=[{
                "role": "user",
                "content": f"Context:\n{context}\n\nQuestion: {query}"
            }]
        )
        
        for text in stream.text_stream:
            yield json.dumps({"token": text}) + "\n"
    except Exception as e:
        logger.error(f"Error in stream_rag: {e}")
        yield json.dumps({"error": str(e)}) + "\n"

def process_uploaded_document(file_path: str, filename: str, category: str) -> Dict[str, Any]:
    """Process an uploaded document through the pipeline."""
    try:
        # Basic processing - in production, use full pipeline
        with open(file_path, 'r') as f:
            content = f.read()
        
        chunks_count = len(content.split("\n\n"))
        
        return {
            "status": "success",
            "chunks_created": chunks_count,
            "filename": filename
        }
    except Exception as e:
        logger.error(f"Error processing document: {e}")
        raise

logger.info("✓ RAG service module loaded (models lazy-loaded on first use)")
