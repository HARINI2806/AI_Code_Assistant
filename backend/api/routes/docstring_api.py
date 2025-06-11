# api/docstring_api.py

from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import JSONResponse
from docstring_generator import add_docstrings, preview_docstrings
import os

router = APIRouter()

@router.post("/docstring/add")
async def add_docstrings_endpoint(
    language: str = Form(..., description="One of: python, javascript, java"),
    file: UploadFile = File(...)
):
    try:
        contents = await file.read()
        original_code = contents.decode("utf-8")
        result_code = add_docstrings(original_code, language)
        return JSONResponse(content={"updated_code": result_code})
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@router.post("/docstring/preview")
async def preview_docstrings_endpoint(
    language: str = Form(..., description="One of: python, javascript, java"),
    file: UploadFile = File(...)
):
    try:
        contents = await file.read()
        original_code = contents.decode("utf-8")
        diff = preview_docstrings(original_code, language)
        return JSONResponse(content={"diff": diff})
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
