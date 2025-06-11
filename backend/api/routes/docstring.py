from fastapi import APIRouter
from pydantic import BaseModel
import os
from docstring_generator.docstring_generator import generate_docstrings_in_codebase

router = APIRouter()

class DocstringRequest(BaseModel):
    codebase_path: str = "./sample-codebase"
    output_dir: str = "./output/docstringified"
    preview_only: bool = False

@router.post("/generate")
async def generate_docstrings(request: DocstringRequest):
    try:
        os.makedirs(request.output_dir, exist_ok=True)
        result = await generate_docstrings_in_codebase(
            codebase_path=request.codebase_path,
            output_path=request.output_dir,
            apply_changes=not request.preview_only
        )
        return {"message": "Docstrings generated." if not request.preview_only else "Preview mode.", "results": result}
    except Exception as e:
        return {"error": str(e)}
