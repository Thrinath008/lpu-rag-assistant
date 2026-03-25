# ============================================================
# Project : LPU RAG Knowledge Assistant
# Author  : Thrinath
# Year    : 2026
# Module  : admin.py
# ============================================================
import os
import sys
import shutil

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
try:
    from scripts._watermark import _stamp
    _stamp("admin_routes")
except ImportError:
    pass

from fastapi import APIRouter, File, UploadFile, Form, HTTPException, Depends, Header
from pydantic import BaseModel
from api.core.config import settings
from api.services.pipeline_service import process_uploaded_document

router = APIRouter()

class ProcessResponse(BaseModel):
    status: str
    message: str
    chunks_created: int
    category: str

def verify_admin_key(x_admin_key: str = Header(None)):
    if not x_admin_key or x_admin_key != settings.ADMIN_KEY:
        raise HTTPException(status_code=403, detail="Forbidden: Invalid Admin Key")
    return x_admin_key

@router.post("/admin/upload", response_model=ProcessResponse)
async def upload_document(
    file: UploadFile = File(...),
    category: str = Form(...),
    admin_key: str = Depends(verify_admin_key)
):
    if not file.filename.endswith(".docx"):
        raise HTTPException(status_code=400, detail="Only .docx files are allowed.")
        
    # Save uploaded file
    raw_cat_path = os.path.join(settings.DOCS_RAW_DIR, category)
    os.makedirs(raw_cat_path, exist_ok=True)
    
    file_path = os.path.join(raw_cat_path, file.filename)
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Process the newly uploaded file via the pipeline
        result = process_uploaded_document(file_path, file.filename, category)
        
        return ProcessResponse(
            status="success",
            message=f"Document {file.filename} processed successfully.",
            chunks_created=result["chunks_created"],
            category=category
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
