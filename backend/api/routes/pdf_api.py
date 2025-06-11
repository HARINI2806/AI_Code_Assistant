# pdf_generator/pdf_api.py

import os
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from pdf_generator.pdf_generator import generate_pdf_from_codebase, PDF_OUTPUT_PATH

router = APIRouter()

class PDFRequest(BaseModel):
    codebase_path: str | None = None

@router.post("/pdf")
async def generate_pdf(req: PDFRequest):
    path = req.codebase_path or "./sample-codebase"
    if not os.path.exists(path):
        raise HTTPException(status_code=400, detail=f"Invalid codebase path: {path}")

    try:
        result_path = await generate_pdf_from_codebase(path)
        return {"message": "PDF generated successfully", "file_path": result_path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/pdf/download")
async def download_pdf():
    if not os.path.exists(PDF_OUTPUT_PATH):
        raise HTTPException(status_code=404, detail="PDF not found. Please generate it first.")
    return FileResponse(path=PDF_OUTPUT_PATH, filename="codebase_summary.pdf", media_type="application/pdf")
