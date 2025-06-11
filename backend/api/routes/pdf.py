from fastapi import APIRouter
from pydantic import BaseModel
from pdf_generator.pdf_generator import generate_pdf_from_codebase
import os
from fastapi.responses import FileResponse
router = APIRouter()

class PDFRequest(BaseModel):
    codebase_path: str = "./sample-codebase"
    output_path: str = "./output/tutorial.pdf"


@router.post("/generate")
def generate_pdf(request: PDFRequest):
    """
    Generate tutorial-style PDF from the codebase.
    """
    try:
        if not os.path.exists(request.codebase_path):
            return {"error": f"Path not found: {request.codebase_path}"}

        generate_pdf_from_codebase(
            codebase_path=request.codebase_path,
            output_pdf_path=request.output_path
        )

        return {"message": f"PDF generated at {request.output_path}"}

    except Exception as e:
        return {"error": str(e)}



@router.get("/download")
def download_pdf(path: str = "./output/tutorial.pdf"):
    """
    Download the generated PDF.
    """
    if not os.path.exists(path):
        return {"error": f"PDF not found at {path}"}

    return FileResponse(
        path,
        media_type="application/pdf",
        filename=os.path.basename(path)
    )
