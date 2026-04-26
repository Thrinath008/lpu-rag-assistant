# ============================================================
# Project : LPU RAG Knowledge Assistant
# Authors : Thrinath, Shambhavi, Arshad
# Year    : 2026
# Module  : confidence_service.py
# Phase   : 3 — Memory + Intelligence + API + Frontend
# ============================================================
import sys
import os
from typing import List, Dict

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

try:
    from scripts._watermark import _stamp
    _MODULE_STAMP = _stamp("confidence_service")
except ImportError:
    pass

class ConfidenceService:
    def score(self, chunks: List[Dict], category: str) -> Dict:
        """
        Scores the quality of retrieval results.
        Provides confidence level metadata to the user.
        """
        if not chunks:
            return {
                "level": "LOW",
                "label": "Low confidence",
                "best_score": 0.0,
                "avg_score": 0.0,
                "strong_chunks": 0,
                "message": "Limited information found — please contact the relevant university office directly.",
                "color": "red"
            }
            
        scores = [chunk.get("score", 0.0) for chunk in chunks]
        best_score = max(scores)
        avg_score = sum(scores) / len(scores) if scores else 0.0
        strong_chunks = sum(1 for s in scores if s > 0.60)
        
        # Determine confidence thresholds
        if best_score >= 0.75:
            level = "HIGH"
            label = "High confidence"
            color = "green"
            message = "Answer based on official documents."
        elif best_score >= 0.50:
            level = "MEDIUM"
            label = "Medium confidence"
            color = "yellow"
            message = "Answer may be incomplete — verify with university if critical."
        else:
            level = "LOW"
            label = "Low confidence"
            color = "red"
            message = "Limited information found — please contact the relevant university office directly."
            
        return {
            "level": level,
            "label": label,
            "best_score": best_score,
            "avg_score": avg_score,
            "strong_chunks": strong_chunks,
            "message": message,
            "color": color
        }

    def is_off_topic(self, chunks: List[Dict]) -> bool:
        """
        Returns True if best score < 0.30
        Means query is completely unrelated to LPU.
        """
        if not chunks:
            return True
            
        best_score = max([chunk.get("score", 0.0) for chunk in chunks])
        return best_score < 0.30

confidence_service = ConfidenceService()
