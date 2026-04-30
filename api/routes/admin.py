# ============================================================
# Project : LPU RAG Knowledge Assistant
# Authors : Thrinath, Shambhavi, irshad
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

from fastapi import APIRouter, File, UploadFile, Form, HTTPException, Depends
from pydantic import BaseModel
from api.core.config import settings
from api.services.pipeline_service import process_uploaded_document
from api.routes.auth import get_admin_user
from api.core.auth import User

router = APIRouter()

from api.models.admin_models import ProcessResponse

@router.post("/admin/upload", response_model=ProcessResponse)
async def upload_document(
    file: UploadFile = File(...),
    category: str = Form(...),
    admin_user: User = Depends(get_admin_user)
):
    """
    Upload and process a new document.
    Requires admin authentication.
    """
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
