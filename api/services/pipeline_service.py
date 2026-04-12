# ============================================================
# Project : LPU RAG Knowledge Assistant
# Author  : Thrinath
# Year    : 2026
# Module  : pipeline_service.py
# ============================================================
import os
import sys
import json

from api.core.config import settings
from api.core.logging import logger

def process_uploaded_document(filepath: str, filename: str, category: str):
    """
    Process a single uploaded .docx file through the entire RAG pipeline.
    Lazy-loads pipeline modules on first use.
    """
    try:
        # Lazy import pipeline functions
        from scripts.convert_docx_to_text import extract_text_from_docx
        from scripts.chunk_documents import split_into_chunks
        from scripts.embed_and_store import store_embeddings
        
        # 1. Convert to Text
        clean_cat_path = os.path.join(settings.DOCS_CLEAN_DIR, category)
        os.makedirs(clean_cat_path, exist_ok=True)
        
        txt_filename = filename.replace(".docx", ".txt")
        txt_path = os.path.join(clean_cat_path, txt_filename)
        
        text = extract_text_from_docx(filepath)
        with open(txt_path, "w", encoding="utf-8") as f:
            f.write(text)
        
        logger.info(f"✓ Extracted text from {filename}")
        
        # 2. Split into chunks
        chunks = split_into_chunks(text, filename, category)
        logger.info(f"✓ Created {len(chunks)} chunks from {filename}")
        
        # 3. Embed and store
        store_embeddings(chunks, category)
        logger.info(f"✓ Stored embeddings for {filename}")
        
        return {
            "status": "success",
            "chunks_created": len(chunks),
            "filename": filename
        }
    except Exception as e:
        logger.error(f"Pipeline error: {e}")
        raise

logger.info("✓ Pipeline service module loaded")
