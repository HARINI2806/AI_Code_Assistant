from fastapi import APIRouter
from pydantic import BaseModel
from summarizer.summary_generator import generate_summaries
import os

router = APIRouter()

class SummarizeRequest(BaseModel):
    codebase_path: str = "./sample-codebase"
    max_tokens: int = 800

@router.post("/generate")
async def summarize_codebase(request: SummarizeRequest):
    """
    Asynchronously summarize the codebase at the given path.
    """
    if not os.path.exists(request.codebase_path):
        return {"error": f"Path not found: {request.codebase_path}"}

    summaries = await generate_summaries(
        request.codebase_path,
        max_tokens=request.max_tokens
    )

    return {"summaries": summaries}
