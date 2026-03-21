# ============================================================
# Project : LPU RAG Knowledge Assistant
# Author  : Thrinath
# Module  : rag_query.py
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
_MODULE_STAMP = _stamp("rag_query")

import os
import sys
import chromadb
from sentence_transformers import SentenceTransformer
from groq import Groq
from dotenv import load_dotenv

# ── Load Environment Variables ─────────────────────────────────────────────
dotenv_path = os.path.join(os.path.dirname(__file__), "..", ".env")
load_dotenv(dotenv_path)

api_key = os.environ.get("GROQ_API_KEY")
if not api_key:
    print("❌ GROQ_API_KEY not found in .env file.")
    print(f"   Expected .env location: {os.path.abspath(dotenv_path)}")
    sys.exit(1)

print(f"✅ Environment loaded.")
print(f"🔐 System: {_get_signature()}")

# ── Configuration ──────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROMA_DIR      = os.path.join(BASE_DIR, "embeddings")
COLLECTION_NAME = "lpu_knowledge_base"
EMBED_MODEL     = "all-MiniLM-L6-v2"
TOP_K           = 5
GROQ_MODEL      = "llama-3.1-8b-instant"

# ── System Prompt ──────────────────────────────────────────────────────────
SYSTEM_PROMPT = """You are an AI assistant for Lovely Professional University (LPU).
Your job is to answer student queries accurately using only the provided context.

Rules:
- Answer only based on the provided context.
- If the answer is not found in the context, say: "I could not find this information in the available LPU policy documents. Please contact the relevant university office."
- Be clear, concise, and helpful.
- When referencing rules or numbers, be precise.
- Always mention the source document when possible."""

# ── Initialize Components ──────────────────────────────────────────────────
print("🔄 Initializing RAG pipeline...")

# Embedding model
embedding_model = SentenceTransformer(EMBED_MODEL)

# ChromaDB
chroma_client = chromadb.PersistentClient(path=CHROMA_DIR)
collection    = chroma_client.get_collection(COLLECTION_NAME)

# Groq client
groq_client = Groq(api_key=api_key)

print("✅ RAG pipeline ready.\n")


# ── Retrieval ──────────────────────────────────────────────────────────────

def retrieve_chunks(query: str, top_k: int = TOP_K) -> list[dict]:
    """
    Embed the query and retrieve the most
    relevant chunks from ChromaDB.
    """
    query_embedding = embedding_model.encode(query).tolist()

    results = collection.query(
        query_embeddings = [query_embedding],
        n_results        = top_k,
        include          = ["documents", "metadatas", "distances"]
    )

    chunks = []
    for i in range(len(results["documents"][0])):
        chunks.append({
            "text"        : results["documents"][0][i],
            "source_file" : results["metadatas"][0][i]["source_file"],
            "category"    : results["metadatas"][0][i]["category"],
            "chunk_index" : results["metadatas"][0][i]["chunk_index"],
            "token_count" : results["metadatas"][0][i]["token_count"],
            "score"       : round(1 - results["distances"][0][i], 4)
        })

    return chunks


# ── Context Builder ────────────────────────────────────────────────────────

def build_context(chunks: list[dict]) -> str:
    """
    Format retrieved chunks into a clean
    context block for Groq.
    """
    context_parts = []
    for i, chunk in enumerate(chunks, 1):
        context_parts.append(
            f"[Source {i}: {chunk['source_file']} | "
            f"Category: {chunk['category']} | "
            f"Relevance: {chunk['score']}]\n\n"
            f"{chunk['text']}"
        )
    return "\n\n---\n\n".join(context_parts)


# ── Generation ─────────────────────────────────────────────────────────────

def generate_answer(query: str, context: str) -> dict:
    """
    Send query + context to Groq LLaMA
    and return the generated answer.
    """
    user_message = f"""Context from LPU policy documents:

{context}

---

Student Query: {query}

Please answer the query based on the context provided above."""

    response = groq_client.chat.completions.create(
        model       = GROQ_MODEL,
        temperature = 0.2,
        max_tokens  = 1024,
        messages    = [
            {
                "role"   : "system",
                "content": SYSTEM_PROMPT
            },
            {
                "role"   : "user",
                "content": user_message
            }
        ]
    )

    answer_text = response.choices[0].message.content
    return {
        "answer"    : answer_text,
        "author_sig": _AUTHOR_FULL,
        "integrity" : _MODULE_STAMP["sig"]
    }


# ── Full RAG Pipeline ──────────────────────────────────────────────────────

def ask(query: str) -> str:
    """
    End-to-end RAG pipeline:
    retrieve → build context → generate answer.
    """
    print(f"\n{'='*60}")
    print(f"📌 Query: {query}")
    print(f"{'='*60}")

    # Step 1 — Retrieve relevant chunks
    chunks = retrieve_chunks(query)

    print(f"\n📚 Retrieved {len(chunks)} relevant chunks:")
    for i, chunk in enumerate(chunks, 1):
        print(
            f"   {i}. [{chunk['category']}] "
            f"{chunk['source_file']} "
            f"(chunk {chunk['chunk_index']} | "
            f"relevance: {chunk['score']})"
        )

    # Step 2 — Build context from chunks
    context = build_context(chunks)

    # Step 3 — Generate answer using Groq
    print(f"\n🤖 Generating answer with Groq ({GROQ_MODEL})...")
    answer_data = generate_answer(query, context)

    print(f"\n💬 Answer:\n")
    print(answer_data["answer"])
    print(f"\n{'='*60}\n")

    return answer_data


# ── Interactive Mode ───────────────────────────────────────────────────────

if __name__ == "__main__":

    # ── Test Queries ───────────────────────────────────────────────────────
    test_queries = [
        "What is the minimum attendance required to appear in exams at LPU?",
        "How many books can a regular student borrow from the LPU library?",
        "What is the minimum CGPA required to apply for semester abroad?",
    ]

    print("🧪 Running test queries...\n")
    for query in test_queries:
        ask(query)

    # ── Interactive Loop ───────────────────────────────────────────────────
    print("\n✅ Test queries complete.")
    print("💬 You can now ask your own questions.")
    print("   Type 'exit' to quit.\n")

    while True:
        try:
            user_input = input("🎓 Ask LPU Assistant: ").strip()
        except KeyboardInterrupt:
            print("\n👋 Goodbye!")
            break

        if not user_input:
            continue

        if user_input.lower() in ["exit", "quit", "q"]:
            print("👋 Goodbye!")
            break

        ask(user_input)