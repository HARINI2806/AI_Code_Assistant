# summarizer/summarizer.py

import os
import asyncio
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from summarizer.summary_generator import generate_summaries

router = APIRouter()

DEFAULT_CODEBASE_PATH = "./sample-codebase"

class SummaryRequest(BaseModel):
    codebase_path: str | None = None

@router.post("/summary")
async def get_codebase_summary(req: SummaryRequest):
    codebase_path = req.codebase_path or DEFAULT_CODEBASE_PATH

    if not os.path.exists(codebase_path):
        raise HTTPException(status_code=400, detail=f"Invalid path: {codebase_path}")
    
    try:
        summary = await generate_summaries(codebase_path)
        return {"summary": summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
