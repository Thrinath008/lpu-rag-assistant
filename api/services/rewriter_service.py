# ============================================================
# Project : LPU RAG Knowledge Assistant
# Authors : Thrinath, Shambhavi, Arshad
# Year    : 2026
# Module  : rewriter_service.py
# Phase   : 3 — Memory + Intelligence + API + Frontend
# ============================================================
import sys
import os
from typing import List, Dict
from groq import Groq

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

try:
    from scripts._watermark import _stamp
    _MODULE_STAMP = _stamp("rewriter_service")
except ImportError:
    pass

from api.core.config import settings
from api.prompts.rewriter_prompt import REWRITER_PROMPT

class RewriterService:
    def __init__(self):
        self.client = None

    def _get_client(self):
        if not self.client:
            self.client = Groq(api_key=settings.GROQ_API_KEY)
        return self.client

    def rewrite(self, query: str, history: List[Dict]) -> str:
        """Returns rewritten standalone query"""
        # Returns original query if history empty
        if not history:
            return query
            
        try:
            # Format history (last 4 messages as requested)
            recent_history = history[-4:]
            formatted_history = "\n".join([f"{msg['role'].capitalize()}: {msg['content']}" for msg in recent_history])
            
            prompt = REWRITER_PROMPT.format(history=formatted_history, query=query)
            
            response = self._get_client().chat.completions.create(
                model=settings.GROQ_MODEL,
                temperature=0.0,
                max_tokens=200,
                messages=[{"role": "user", "content": prompt}]
            )
            
            rewritten_query = response.choices[0].message.content.strip()
            
            # Fallback if something went wrong
            if not rewritten_query or "Error" in rewritten_query:
                return query
                
            return rewritten_query
            
        except Exception as e:
            # Returns original query if rewrite fails
            import logging
            logging.error(f"Error in RewriterService: {str(e)}")
            return query

rewriter_service = RewriterService()
