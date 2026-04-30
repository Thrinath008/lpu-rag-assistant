# ============================================================
# Project : LPU RAG Knowledge Assistant
# Authors : Thrinath, Shambhavi, irshad
# Year    : 2026
# Module  : memory_service.py
# Phase   : 3 — Memory + Intelligence + API + Frontend
# ============================================================
import sys
import os
import uuid
import time
from typing import List, Dict

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
try:
    from scripts._watermark import _stamp
    _MODULE_STAMP = _stamp("memory_service")
except ImportError:
    pass

# In-memory session store
# Structure: { session_id: { "history": [ {role, content} ], "created_at": timestamp, "last_active": timestamp } }
_SESSIONS: Dict[str, Dict] = {}

class MemoryService:
    def __init__(self, max_history: int = 10, ttl_hours: int = 2):
        self.max_history = max_history
        self.ttl_seconds = ttl_hours * 3600
        
    def create_session(self) -> str:
        """Creates new session, returns session_id (UUID)"""
        self.cleanup_expired_sessions()
        session_id = str(uuid.uuid4())
        now = time.time()
        _SESSIONS[session_id] = {
            "history": [],
            "created_at": now,
            "last_active": now
        }
        return session_id

    def get_history(self, session_id: str) -> List[Dict]:
        """Returns list of message dicts for session. Returns empty list if session not found."""
        session = _SESSIONS.get(session_id)
        if session:
            session["last_active"] = time.time()
            return session["history"]
        return []

    def add_message(self, session_id: str, role: str, content: str) -> None:
        """Adds message to session history and enforces 10 message rolling window."""
        session = _SESSIONS.get(session_id)
        if not session:
            return
            
        session["history"].append({"role": role, "content": content})
        session["last_active"] = time.time()
        
        # Enforce rolling window
        if len(session["history"]) > self.max_history:
            # We want to keep balanced context, so we slice off the oldest interactions.
            # Usually keep the very first message if it's systemic, but here we just slice
            session["history"] = session["history"][-self.max_history:]

    def clear_session(self, session_id: str) -> None:
        """Clears all messages for session."""
        session = _SESSIONS.get(session_id)
        if session:
            session["history"] = []
            session["last_active"] = time.time()

    def session_exists(self, session_id: str) -> bool:
        """Returns True if session exists."""
        return session_id in _SESSIONS

    def get_session_stats(self, session_id: str) -> dict:
        """Returns message count, created_at, last_active."""
        session = _SESSIONS.get(session_id)
        if not session:
            return {}
        return {
            "message_count": len(session["history"]),
            "created_at": session["created_at"],
            "last_active": session["last_active"]
        }

    def cleanup_expired_sessions(self) -> int:
        """Removes sessions inactive > 2 hours. Returns number of sessions removed."""
        now = time.time()
        expired_keys = [
            sid for sid, data in _SESSIONS.items() 
            if now - data["last_active"] > self.ttl_seconds
        ]
        for sid in expired_keys:
            del _SESSIONS[sid]
        return len(expired_keys)

# Singleton instance
memory_service = MemoryService()
