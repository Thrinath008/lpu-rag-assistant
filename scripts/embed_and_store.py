# ============================================================
# Project : LPU RAG Knowledge Assistant
# Author  : Thrinath
# Module  : embed_and_store.py
# Signature: T-RAG-LPU-2026-THRINATH
# ============================================================
# This code is the original work of Thrinath.
# Built as part of the LPU RAG Knowledge Assistant project.
# Unauthorized use, copying, or redistribution is prohibited.
# Integrity token: 5468726e617468 (hex encoded author name)
# ============================================================

import sys
sys.path.insert(0, ".")
from _watermark import _stamp, _get_signature, _AUTHOR_FULL

# Silent integrity verification on every run
_MODULE_STAMP = _stamp("embed_and_store")

import os
import json
from sentence_transformers import SentenceTransformer
import chromadb

# ── Configuration ──────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHUNKS_DIR  = os.path.join(BASE_DIR, "chunks")
CHROMA_DIR  = os.path.join(BASE_DIR, "embeddings")
COLLECTION  = "lpu_knowledge_base"
MODEL_NAME  = "all-MiniLM-L6-v2"   # fast, accurate, free, no API key needed

# ── Initialize Embedding Model ─────────────────────────────────────────────
print(f"🔄 Loading embedding model: {MODEL_NAME}")
model = SentenceTransformer(MODEL_NAME)
print("✅ Model loaded.\n")

# ── Initialize ChromaDB ────────────────────────────────────────────────────
client     = chromadb.PersistentClient(path=CHROMA_DIR)
collection = client.get_or_create_collection(
    name     = COLLECTION,
    metadata = {"hnsw:space": "cosine"}   # cosine similarity for semantic search
)


# ── Load All Chunks ────────────────────────────────────────────────────────

def load_all_chunks() -> list[dict]:
    all_chunks = []
    for category in sorted(os.listdir(CHUNKS_DIR)):
        category_path = os.path.join(CHUNKS_DIR, category)
        if not os.path.isdir(category_path):
            continue
        for filename in sorted(os.listdir(category_path)):
            if not filename.endswith(".json"):
                continue
            filepath = os.path.join(category_path, filename)
            with open(filepath, "r", encoding="utf-8") as f:
                chunks = json.load(f)
            all_chunks.extend(chunks)
    return all_chunks


# ── Embed and Store ────────────────────────────────────────────────────────

def embed_and_store():
    print("📂 Loading chunks...")
    chunks = load_all_chunks()
    print(f"✅ {len(chunks)} chunks loaded.\n")

    # Prepare data for ChromaDB
    ids         = []
    texts       = []
    metadatas   = []

    for chunk in chunks:
        ids.append(chunk["chunk_id"])
        texts.append(chunk["text"])
        metadatas.append({
            "source_file" : chunk["source_file"],
            "category"    : chunk["category"],
            "chunk_index" : chunk["chunk_index"],
            "token_count" : chunk["token_count"]
        })

    # Generate embeddings
    print("🔄 Generating embeddings...")
    embeddings = model.encode(
        texts,
        show_progress_bar = True,
        batch_size        = 16
    )
    print(f"✅ {len(embeddings)} embeddings generated.\n")

    # Store in ChromaDB
    print("💾 Storing in ChromaDB...")
    collection.add(
        ids        = ids,
        documents  = texts,
        embeddings = [e.tolist() for e in embeddings],
        metadatas  = metadatas
    )

    print(f"✅ All {len(chunks)} chunks stored in ChromaDB.")
    print(f"📁 Vector DB saved to: {os.path.abspath(CHROMA_DIR)}")
    print(f"🗂️  Collection name: {COLLECTION}")
    print(f"\n📊 Final Summary:")
    print(f"   Total documents : 13")
    print(f"   Total chunks    : {len(chunks)}")
    print(f"   Embedding model : {MODEL_NAME}")
    print(f"   Vector DB       : ChromaDB (persistent)")


if __name__ == "__main__":
    embed_and_store()