from fastapi import APIRouter
from pydantic import BaseModel
from summarizer.summary_generator import generate_summaries

router = APIRouter()

class SummaryRequest(BaseModel):
    codebase_path: str = "./sample-codebase"
    streaming: bool = False
    as_dict: bool = True  # future support for PDF/file return

@router.post("/generate")
async def generate_codebase_summary(request: SummaryRequest):
    """
    Generate summaries of all supported code files in the codebase.
    """
    try:
        result = await generate_summaries(
            code_path=request.codebase_path,
            streaming=request.streaming
        )
        return {
            "message": "Summary generated",
            "summaries": result
        }
    except Exception as e:
        return {"error": str(e)}
