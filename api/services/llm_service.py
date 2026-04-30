# ============================================================
# Project : LPU RAG Knowledge Assistant
# Authors : Thrinath, Shambhavi, irshad
# Year    : 2026
# Module  : llm_service.py
# Phase   : 3 — Memory + Intelligence + API + Frontend
# ============================================================
import sys
import os
from typing import List, Dict
from groq import Groq

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

try:
    from scripts._watermark import _stamp
    _MODULE_STAMP = _stamp("llm_service")
except ImportError:
    pass

from api.core.config import settings

class LLMService:
    def __init__(self):
        self.client = None

    def _get_client(self):
        if not self.client:
            self.client = Groq(api_key=settings.GROQ_API_KEY)
        return self.client

    def generate(self, system_prompt: str, history: List[Dict], context: str, query: str) -> str:
        """
        Handles all Groq API calls.
        Injects chat history into messages.
        Uses the production system prompt.
        """
        
        # Build messages array
        messages = [
            {"role": "system", "content": system_prompt}
        ]
        
        # Inject up to last 6 history messages (as requested in Master Prompt)
        if history:
            for msg in history[-6:]:
                messages.append({"role": msg["role"], "content": msg["content"]})
                
# Final prompt formatting
        final_prompt = f"""Context from LPU policy documents:
        
{context}

---

Student Query: {query}

Please answer based only on the context above."""

        messages.append({"role": "user", "content": final_prompt})
        
        try:
            client = self._get_client()
            completion = client.chat.completions.create(
                model=settings.GROQ_MODEL,
                temperature=settings.TEMPERATURE,
                max_tokens=settings.MAX_TOKENS,
                messages=messages
            )
            
            answer = completion.choices[0].message.content.strip()
            
            # Post-process response to ensure no internal tags leak
            import re
            answer = re.sub(r'^(?:CLASSIFICATION|class|response)[^\n]*\n?', '', answer, flags=re.IGNORECASE | re.MULTILINE).strip()
            if answer.upper().startswith("RESPONSE:"):
                answer = answer[10:].strip()
                
            return answer
            
        except Exception as e:
            import logging
            logging.error(f"Error in LLMService: {e}")
            return f"I apologize, but I encountered an error communicating with the generation service: {str(e)}"

llm_service = LLMService()
