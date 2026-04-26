from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional
import os

class Settings(BaseSettings):
    # API Keys
    GROQ_API_KEY: str
    GEMINI_API_KEY: Optional[str] = None
    
    # Internal Security
    API_KEY: str = os.getenv("API_KEY", "lpu-rag-dev-key")
    ADMIN_KEY: str = os.getenv("ADMIN_KEY", "lpu-admin-master-key")
    
    # Project Metadata
    PROJECT_NAME: str = "LPU Knowledge Assistant"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Storage & Paths
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    CHROMA_DIR: str = os.path.join(BASE_DIR, "embeddings")
    COLLECTION_NAME: str = "lpu_knowledge_base"
    
    DOCS_RAW_DIR: str = os.path.join(BASE_DIR, "docs_raw")
    DOCS_CLEAN_DIR: str = os.path.join(BASE_DIR, "docs_clean")
    CHUNKS_DIR: str = os.path.join(BASE_DIR, "chunks")
    
    # Model Config
    GROQ_MODEL: str = "llama-3.1-8b-instant"
    EMBED_MODEL: str = "all-MiniLM-L6-v2"
    TOP_K: int = 5
    MAX_TOKENS: int = 1024
    TEMPERATURE: float = 0.2
    MAX_HISTORY: int = 10
    SESSION_TTL_HRS: int = 2
    MAX_UPLOAD_MB: int = 10
    
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
