# ============================================================
# Project : LPU RAG Knowledge Assistant
# Authors : Thrinath, Shambhavi, irshad
# Year    : 2026
# Module  : classifier_service.py
# Phase   : 3 — Memory + Intelligence + API + Frontend
# ============================================================
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

try:
    from scripts._watermark import _stamp
    _MODULE_STAMP = _stamp("classifier_service")
except ImportError:
    pass

class ClassifierService:
    def __init__(self):
        self.category_keywords = {
            "academic": [
                "attendance", "exam", "cgpa", "grade", "reappear", 
                "backlog", "detention", "marks", "result", "odl", "classes"
            ],
            "administration": [
                "certificate", "bonafide", "document", "attestation", "verification"
            ],
            "career": [
                "placement", "internship", "job", "company", "drive", 
                "pep", "spc", "recruitment", "offer", "resume"
            ],
            "facilities": [
                "library", "book", "hostel", "mess", "room", "food", 
                "residential", "gym", "parking", "laundry"
            ],
            "finance": [
                "fee", "scholarship", "payment", "emi", "refund", 
                "charges", "cost", "amount", "rupees", "finance"
            ],
            "international": [
                "visa", "passport", "frro", "abroad", "foreign", 
                "international", "fsis", "semester abroad", "exchange", "semester exchange"
            ]
        }

    def classify(self, query: str) -> str:
        """
        Returns category string.
        Uses keyword matching.
        Returns "general" if no match.
        """
        query_lower = query.lower()
        
        # Simple frequency counting for keyword matches
        category_scores = {cat: 0 for cat in self.category_keywords.keys()}
        matched_any = False
        
        for category, keywords in self.category_keywords.items():
            for kw in keywords:
                if kw in query_lower:
                    category_scores[category] += 1
                    matched_any = True
                    
        if not matched_any:
            return "general"
            
        # Return the category with the highest score
        best_category = max(category_scores.items(), key=lambda x: x[1])
        if best_category[1] > 0:
            return best_category[0]
            
        return "general"

    def get_category_filter(self, category: str) -> dict | None:
        """
        Returns ChromaDB where filter for category.
        Returns None for "general" (no filter).
        """
        if not category or category == "general":
            return None
            
        return {
            "category": category
        }

classifier_service = ClassifierService()
