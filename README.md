# LPU Knowledge Assistant — RAG-Based QA System

Welcome to the **LPU Knowledge Assistant**, a robust, domain-specific Retrieval-Augmented Generation (RAG) system built to provide an intelligent, automated Q&A experience for Lovely Professional University (LPU) students. This project demonstrates end-to-end data processing, semantic search, and context-aware natural language generation.

## 🌟 Project Overview

- **Author**: Thrinath
- **Year**: 2026
- **Architecture**: Retrieval-Augmented Generation (RAG) + REST API
- **Domain**: Institutional Knowledge QA (Academics, Finance, Career, Administration)
- **Status**: Production-Ready MVP

## 🛠️ Tech Stack & Key Components

1. **Large Language Model (LLM):** LLaMA 3.1 8B (via Groq API) for ultra-fast and grounded generation.
2. **Embeddings:** `sentence-transformers/all-MiniLM-L6-v2` for high-quality semantic vectors.
3. **Vector Database:** Local persistent ChromaDB for fast semantic search.
4. **Backend Framework:** FastAPI web server with RESTful endpoints (`/ask`, `/health`, `/stats`).
5. **Data Processing:** Automated pipeline processing `.docx` into cleansed text chunks.

## 🚀 The Data Pipeline

The system is powered by 13 official, structured LPU policy documents (spanning Academics, Career, Facilities, Finance, and International Affairs). The automated pipeline follows these stages:

1. **Text Extraction**: Deep conversion of domain-specific `.docx` university policies into clean raw text.
2. **Semantic Chunking**: Intelligent text splitting with overlap to maintain institutional context without breaking policy clauses.
3. **Embedding Generation**: Transforming text chunks into high-dimensional semantic vectors.
4. **Vector Storage**: Persisting the data in a highly optimized ChromaDB instance.
5. **RAG Retrieval Engine**: A seamless query layer that retrieves the top *K* contextual chunks and prompts the LLaMA 3.1 8B model to generate an accurate, verified answer.

## 📊 Results & Performance

- **Fast Semantic Retrieval**: Able to fetch relevant policy contexts across thousands of text chunks in milliseconds.
- **Accuracy Check**: The LLM successfully mitigates hallucinations by grounding every answer strictly in the retrieved university context.
- **REST Integration**: Easily scalable; front-end agnostic.
- **Strict Provenance**: Rejects questions structurally out of scope instead of guessing, maintaining institutional integrity.

## 💡 How it works under the hood

When a user asks a question (e.g., *"What is the minimum attendance required?"*):
1. The question is passed to the FastAPI `POST /ask` endpoint.
2. The user query is embedded via `all-MiniLM-L6-v2`.
3. ChromaDB performs a similarity search to find the 3 most relevant policy chunks.
4. The LLaMA 3.1 8B model formulates an accurate, helpful response based *only* on that context.
5. The system applies the backend watermark signature ensuring trace integrity.

---
> *Development Notes: Certain raw data vectors, sensitive API credentials, and internal watermark signatures are git-ignored for project security and repository hygiene.*
