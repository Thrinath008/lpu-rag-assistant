# ============================================================
# Project : LPU RAG Knowledge Assistant
# Authors : Thrinath, Shambhavi, Arshad
# Module  : convert_docx_to_text.py
# Signature: T-RAG-LPU-2026-TEAM
# ============================================================
# This code is the work of Thrinath, Shambhavi, and Arshad.
# Built as part of the LPU RAG Knowledge Assistant project.
# Unauthorized use, copying, or redistribution is prohibited.
# Integrity token: 5468726e617468 (hex encoded author name)
# ============================================================

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _watermark import _stamp, _get_signature, _AUTHOR_FULL

# Silent integrity verification on every run
_MODULE_STAMP = _stamp("convert_docx_to_text")

import os
from docx import Document

# Define paths
import os
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW_DIR = os.path.join(BASE_DIR, "docs_raw")
CLEAN_DIR = os.path.join(BASE_DIR, "docs_clean")

def extract_text_from_docx(filepath):
    """Extract clean plain text from a .docx file."""
    doc = Document(filepath)
    paragraphs = []

    for para in doc.paragraphs:
        text = para.text.strip()
        if text:  # Skip empty lines
            paragraphs.append(text)

    return "\n\n".join(paragraphs)


def convert_all_docs():
    """Walk through docs_raw, convert all .docx to .txt in docs_clean."""
    converted = 0
    skipped = 0

    for category in os.listdir(RAW_DIR):
        category_path = os.path.join(RAW_DIR, category)

        if not os.path.isdir(category_path):
            continue

        # Mirror the category folder in docs_clean
        clean_category_path = os.path.join(CLEAN_DIR, category)
        os.makedirs(clean_category_path, exist_ok=True)

        for filename in os.listdir(category_path):
            if not filename.endswith(".docx"):
                skipped += 1
                continue

            docx_path = os.path.join(category_path, filename)
            txt_filename = filename.replace(".docx", ".txt")
            txt_path = os.path.join(clean_category_path, txt_filename)

            try:
                text = extract_text_from_docx(docx_path)
                with open(txt_path, "w", encoding="utf-8") as f:
                    f.write(text)
                print(f"✅ Converted: {category}/{filename}")
                converted += 1

            except Exception as e:
                print(f"❌ Failed: {filename} → {e}")
                skipped += 1

    print(f"\n📊 Summary: {converted} converted, {skipped} skipped.")


if __name__ == "__main__":
    convert_all_docs()