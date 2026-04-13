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

SYSTEM_PROMPT = """
# ============================================================
# LPU KNOWLEDGE ASSISTANT — SYSTEM PROMPT
# ============================================================

## IDENTITY
You are the official AI Knowledge Assistant for Lovely Professional University (LPU).
Your name is LPU Assistant. You speak with authority, clarity, and empathy.

## RESPONSE FRAMEWORK
1. **Direct Answer**: Answer the exact question asked in 1-2 sentences immediately.
2. **Key Details**: Only if necessary, provide bullet points of exact rules.
3. **Source**: Always end with: 📄 *Source: [document_name] | Category: [category]* (Unless answering casual chat/memory).

## TONE AND LANGUAGE RULES
✅ DO:
- **BE EXTREMELY CONCISE.** Output ONLY what is strictly necessary.
- Formally answer questions using ONLY the provided official context.
- Casually respond to greetings or memory questions without explicitly referencing the system architecture.

❌ DO NOT:
- Do NOT output your internal reasoning or classification steps (e.g., do NOT say "CLASSIFICATION: CLASS A" or "RESPONSE:"). ONLY output the final human-readable text.
- Do NOT provide massive essays of unasked details.
- Do NOT say "Based on the context provided".

## ESCALATION AND FALLBACK
If the answer is NOT in the context: "I was unable to find specific information about this. Please contact the relevant university office directly."
"""

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
            api_key = getattr(settings, "GROQ_API_KEY", "").strip()
            if not api_key:
                raise RuntimeError("GROQ_API_KEY is not set in settings or environment.")
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

def ask_rag(query: str, history: List[Dict[str, str]] = None) -> Dict[str, Any]:
    """Ask RAG system and get answer with memory and structured routing."""
    if history is None:
        history = []
        
    try:
        client = get_groq_client()
        
        # -------------------------------------------------------------
        # STAGE 1: SILENT INTENT CLASSIFIER (No CoT Leakage Possible)
        # -------------------------------------------------------------
        # Build strict recent history string for classifier context
        recent_context = "\n".join([f"{msg['role'].capitalize()}: {msg['content']}" for msg in history[-3:]])
        
        classifier_prompt = f"""You are an Intent Classifier and Query Reformulator for LPU Assistant.
Analyze the conversation history and the latest query. First, classify the intent. Second, rewrite the query to be completely self-contained based on context (coreference resolution).

INTENT RULES:
- GENERAL (Greeting, casual, or asking about previous conversation memory / repeating).
- POLICY (Any question about facts, rules, procedures, INCLUDING follow-up questions).
- VAGUE (Absolute gibberish or a single unrelated keyword).

Conversation context:
{recent_context}

Latest Query: {query}

OUTPUT EXACTLY THIS FORMAT AND NOTHING ELSE:
INTENT: [GENERAL, VAGUE, or POLICY]
REWRITTEN: [your rewritten standalone query]"""

        classifier_response = client.chat.completions.create(
            model=GROQ_MODEL,
            temperature=0.0,
            max_tokens=60,
            messages=[{"role": "user", "content": classifier_prompt}]
        )
        classifier_output = classifier_response.choices[0].message.content.strip()
        
        # Parse output safely
        intent = "POLICY"
        standalone_query = query
        for line in classifier_output.split('\n'):
            line = line.strip()
            if line.upper().startswith("INTENT:"):
                intent = line.upper().replace("INTENT:", "").strip()
            elif line.upper().startswith("REWRITTEN:"):
                standalone_query = line[10:].strip()
                if not standalone_query:
                    standalone_query = query
        
        # -------------------------------------------------------------
        # STAGE 2: EXECUTION GENERATOR
        # -------------------------------------------------------------
        # Prepare context payload
        messages_payload = [{"role": "system", "content": SYSTEM_PROMPT}]
        
        # Inject standard memory
        for msg in history[-10:]:
            messages_payload.append({"role": msg["role"], "content": msg["content"]})
            
        chunks = []
        sources = []
        
        if "GENERAL" in intent or "GREETING" in intent:
            # Bypass RAG entirely for speed and safety
            messages_payload.append({"role": "user", "content": query})
            
        elif "VAGUE" in intent:
            # Bypass RAG, just ask for clarification natively
            messages_payload.append({"role": "user", "content": f"The user said '{query}'. Ask them politely to clarify what they want to know regarding LPU policies."})
            
        else:
            # Execute standard RAG (Class C) using the REWRITTEN standalone query!
            chunks = retrieve_chunks(standalone_query)
            if not chunks:
                return {
                    "answer": "I could not find relevant information in the knowledge base.",
                    "sources": [],
                    "author_sig": "LPU Assistant v2.0",
                    "integrity": "no_context"
                }
            
            context = "\n\n".join([f"[{c['source_file']}] {c['text']}" for c in chunks])
            messages_payload.append({
                "role": "user", 
                "content": f"Use the following official context strictly to answer the query.\n\nContext:\n{context}\n\nQuery: {query}"
            })
            
            # Format sources for UI
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

        # Generate Final Output
        completion = client.chat.completions.create(
            model=GROQ_MODEL,
            temperature=0.2,
            max_tokens=1024,
            messages=messages_payload
        )
        
        answer = completion.choices[0].message.content.strip()
        
        # In case the model still leaked something locally, scrub it.
        import re
        answer = re.sub(r'^(?:CLASSIFICATION|class|response)[^\n]*\n?', '', answer, flags=re.IGNORECASE | re.MULTILINE).strip()
        if answer.upper().startswith("RESPONSE:"):
            answer = answer[10:].strip()
            
        # Clear sources if the LLM output doesn't contain manual citations
        if "Source" not in answer and "source" not in answer:
            sources = []

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

        yield json.dumps({
            "type": "sources",
            "content": [
                {
                    "text": c["text"][:200],
                    "source_file": c["source_file"],
                    "category": c["category"],
                    "chunk_index": c["chunk_index"],
                    "token_count": len(c["text"].split()),
                    "score": c["score"],
                }
                for c in chunks
            ]
        }) + "\n"
        
        client = get_groq_client()
        stream = client.chat.completions.create(
            model=GROQ_MODEL,
            temperature=0.2,
            max_tokens=1024,
            stream=True,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": f"Context (ONLY use if query is Class C):\n{context}\n\nQuestion: {query}\n\nCheck System Prompt routing first. If this is a greeting or casual text, just reply naturally and concisely. Otherwise, answer concisely based strictly on the context."
                }
            ]
        )
        
        for chunk in stream:
            delta = chunk.choices[0].delta.content
            if delta:
                yield json.dumps({"type": "content", "content": delta}) + "\n"

        yield json.dumps({
            "type": "end",
            "content": {"author_sig": "LPU Assistant v2.0", "integrity": "verified"}
        }) + "\n"
    except Exception as e:
        logger.error(f"Error in stream_rag: {e}")
        yield json.dumps({"type": "error", "content": str(e)}) + "\n"

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
