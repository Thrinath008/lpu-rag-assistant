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
from scripts.convert_docx_to_text import extract_text_from_docx
from scripts.chunk_documents import split_into_chunks
from scripts.embed_and_store import model, collection

def process_uploaded_document(filepath: str, filename: str, category: str):
    """
    Process a single uploaded .docx file through the entire RAG pipeline.
    """
    # 1. Convert to Text
    clean_cat_path = os.path.join(settings.DOCS_CLEAN_DIR, category)
    os.makedirs(clean_cat_path, exist_ok=True)
    
    txt_filename = filename.replace(".docx", ".txt")
    txt_path = os.path.join(clean_cat_path, txt_filename)
    
    text = extract_text_from_docx(filepath)
    with open(txt_path, "w", encoding="utf-8") as f:
        f.write(text)
        
    # 2. Chunking
    source_name = filename.replace(".docx", "")
    chunks = split_into_chunks(text, source_name, category)
    
    chunks_cat_path = os.path.join(settings.CHUNKS_DIR, category)
    os.makedirs(chunks_cat_path, exist_ok=True)
    
    chunk_json_path = os.path.join(chunks_cat_path, f"{source_name}.json")
    with open(chunk_json_path, "w", encoding="utf-8") as f:
        json.dump(chunks, f, indent=2, ensure_ascii=False)
        
    # 3. Embed and Store
    if chunks:
        ids = []
        texts = []
        metadatas = []
        for c in chunks:
            ids.append(c["chunk_id"])
            texts.append(c["text"])
            metadatas.append({
                "source_file": c["source_file"],
                "category": c["category"],
                "chunk_index": c["chunk_index"],
                "token_count": c["token_count"]
            })
            
        embeddings = model.encode(texts, show_progress_bar=False, batch_size=16)
        
        collection.add(
            ids=ids,
            documents=texts,
            embeddings=[e.tolist() for e in embeddings],
            metadatas=metadatas
        )
    
    return {
        "status": "success",
        "chunks_created": len(chunks),
        "source": source_name,
        "category": category
    }
