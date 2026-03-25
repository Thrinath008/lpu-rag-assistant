# ============================================================
# Project : LPU RAG Knowledge Assistant
# Author  : Thrinath
# Module  : chunk_documents.py
# Signature: T-RAG-LPU-2026-THRINATH
# ============================================================
# This code is the original work of Thrinath.
# Built as part of the LPU RAG Knowledge Assistant project.
# Unauthorized use, copying, or redistribution is prohibited.
# Integrity token: 5468726e617468 (hex encoded author name)
# ============================================================

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _watermark import _stamp, _get_signature, _AUTHOR_FULL

# Silent integrity verification on every run
_MODULE_STAMP = _stamp("chunk_documents")

import os
import json
import tiktoken

# ── Paths ──────────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CLEAN_DIR  = os.path.join(BASE_DIR, "docs_clean")
CHUNKS_DIR = os.path.join(BASE_DIR, "chunks")

# ── Chunking Configuration ─────────────────────────────────────────────────
CHUNK_SIZE    = 400   # max tokens per chunk
CHUNK_OVERLAP = 80    # overlap tokens between consecutive chunks
ENCODER       = tiktoken.get_encoding("cl100k_base")  # same encoder as OpenAI


# ── Helpers ────────────────────────────────────────────────────────────────

def count_tokens(text: str) -> int:
    return len(ENCODER.encode(text))


def split_into_chunks(text: str, source_file: str, category: str) -> list[dict]:
    """
    Split text into overlapping token-bounded chunks.
    Each chunk is returned as a metadata-rich dictionary.
    """
    # Split on double newline (paragraph boundary) first
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]

    chunks      = []
    buffer      = []
    buffer_tokens = 0
    chunk_index = 0

    for para in paragraphs:
        para_tokens = count_tokens(para)

        # If a single paragraph exceeds CHUNK_SIZE, hard-split it by sentences
        if para_tokens > CHUNK_SIZE:
            sentences = para.replace(". ", ".\n").split("\n")
            for sentence in sentences:
                s_tokens = count_tokens(sentence)
                if buffer_tokens + s_tokens > CHUNK_SIZE:
                    if buffer:
                        chunks.append(
                            _build_chunk(buffer, chunk_index, source_file, category)
                        )
                        chunk_index += 1
                        # Keep overlap
                        buffer        = buffer[-2:]
                        buffer_tokens = sum(count_tokens(t) for t in buffer)
                buffer.append(sentence)
                buffer_tokens += s_tokens
            continue

        # Normal paragraph — flush if adding it exceeds CHUNK_SIZE
        if buffer_tokens + para_tokens > CHUNK_SIZE:
            if buffer:
                chunks.append(
                    _build_chunk(buffer, chunk_index, source_file, category)
                )
                chunk_index += 1
                # Keep last few lines as overlap
                buffer        = buffer[-2:]
                buffer_tokens = sum(count_tokens(t) for t in buffer)

        buffer.append(para)
        buffer_tokens += para_tokens

    # Flush remaining buffer
    if buffer:
        chunks.append(_build_chunk(buffer, chunk_index, source_file, category))

    return chunks


def _build_chunk(
    lines: list[str],
    index: int,
    source_file: str,
    category: str
) -> dict:
    text = "\n\n".join(lines)
    return {
        "chunk_id"    : f"{source_file}_chunk_{index}",
        "source_file" : source_file,
        "category"    : category,
        "chunk_index" : index,
        "token_count" : count_tokens(text),
        "text"        : text
    }


# ── Main ───────────────────────────────────────────────────────────────────

def chunk_all_documents():
    total_chunks = 0
    total_docs   = 0

    for category in sorted(os.listdir(CLEAN_DIR)):
        category_path = os.path.join(CLEAN_DIR, category)
        if not os.path.isdir(category_path):
            continue

        out_category_path = os.path.join(CHUNKS_DIR, category)
        os.makedirs(out_category_path, exist_ok=True)

        for filename in sorted(os.listdir(category_path)):
            if not filename.endswith(".txt"):
                continue

            txt_path    = os.path.join(category_path, filename)
            source_name = filename.replace(".txt", "")

            with open(txt_path, "r", encoding="utf-8") as f:
                text = f.read()

            chunks = split_into_chunks(text, source_name, category)

            # Save as JSON
            out_path = os.path.join(out_category_path, f"{source_name}.json")
            with open(out_path, "w", encoding="utf-8") as f:
                json.dump(chunks, f, indent=2, ensure_ascii=False)

            print(
                f"✅  {category}/{filename}"
                f"  →  {len(chunks)} chunks"
                f"  (avg {sum(c['token_count'] for c in chunks)//len(chunks)} tokens)"
            )
            total_chunks += len(chunks)
            total_docs   += 1

    print(f"\n📊 Summary: {total_docs} documents → {total_chunks} total chunks")
    print(f"📁 Saved to: {os.path.abspath(CHUNKS_DIR)}")


if __name__ == "__main__":
    chunk_all_documents()