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
    base_path = "./sample-codebase"
    selected = req.codebase_path or "ALL"
    path = base_path if selected == "ALL" else os.path.join(base_path, selected)

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

@router.get("/pdf/codebases")
def list_codebases():
    base = "./sample-codebase"
    items = []

    for root, dirs, files in os.walk(base):
        for name in dirs + files:
            rel_path = os.path.relpath(os.path.join(root, name), base)
            if any(rel_path.endswith(ext) for ext in [".py", ".js", ".java"]) or os.path.isdir(os.path.join(base, rel_path)):
                items.append(rel_path)
    return {"codebases": ["ALL"] + sorted(items)}
