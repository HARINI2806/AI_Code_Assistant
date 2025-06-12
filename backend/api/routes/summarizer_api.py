# summarizer/summarizer.py

import os
import asyncio
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from summarizer.summary_generator import generate_summaries,generate_impact_summary
from fastapi import UploadFile, File, Form
from fastapi import Query
from fastapi.responses import JSONResponse
router = APIRouter()

DEFAULT_CODEBASE_PATH = "./sample-codebase"

class SummaryRequest(BaseModel):
    codebase_path: str | None = None

@router.post("/summary")
async def get_codebase_summary(req: SummaryRequest):
    codebase_path = req.codebase_path or DEFAULT_CODEBASE_PATH
    print(codebase_path)
    if not os.path.exists(codebase_path):
        raise HTTPException(status_code=400, detail=f"Invalid path: {codebase_path}")
    
    try:
        summary = await generate_summaries(codebase_path)
        return {"summary": summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/summary/impact")
async def summarize_impact(
    file: UploadFile = File(None),
    code: str = Form(None),
    file_path: str = Form(None)
):
    base_path = "./sample-codebase"
    modified_code = ""
    original_code = None

    if file:
        modified_code = (await file.read()).decode()
    elif code:
        modified_code = code
    elif file_path:
        safe_path = path.replace("..", "").replace("\\", "/")
        full_path = os.path.join(base_path, safe_path)
        with open(full_path, "r") as f:
            modified_code = f.read()

    # If file_path is present and we have code, load original from disk
    if file_path and code:
        full_path = os.path.join(base_path, file_path)
        if os.path.exists(full_path):
            with open(full_path, "r") as f:
                original_code = f.read()

    if not modified_code.strip():
        raise HTTPException(status_code=400, detail="No code provided for analysis.")

    summary = await generate_impact_summary(modified_code, original_code)

    return {"impact_summary": summary}
@router.get("/codebase/file")
def get_file_content(path: str = Query(...)):
    full_path = os.path.join("./sample-codebase/", path)
    if not os.path.exists(full_path):
        raise HTTPException(status_code=404, detail="File not found")

    with open(full_path, "r", encoding="utf-8") as f:
        return JSONResponse({"code": f.read()})