from fastapi import APIRouter, UploadFile, File, Form
from docstring_generator.docstring_generator import batch_generate_docstrings

router = APIRouter()

@router.post("/docstring/generate")
async def generate_docstrings(file: UploadFile = File(...), language: str = Form("python")):
    content = await file.read()
    source = content.decode()

    result = await batch_generate_docstrings(source, language)
    return result
