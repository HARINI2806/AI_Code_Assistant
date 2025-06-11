from fastapi import APIRouter
from pydantic import BaseModel
from visualizer.visualizer import generate_all_diagrams
import os
from fastapi.responses import FileResponse

router = APIRouter()

class VisualizerRequest(BaseModel):
    codebase_path: str = "./sample-codebase"
    output_dir: str = "./output/diagrams"
    formats: list[str] = ["mmd"]  # or ["svg"], or both

@router.post("/generate")
def generate_visualizations(request: VisualizerRequest):
    """
    Generate diagrams (class/inheritance/dependency) for the codebase.
    """
    try:
        os.makedirs(request.output_dir, exist_ok=True)

        results = generate_all_diagrams(
            codebase_path=request.codebase_path,
            output_dir=request.output_dir,
            formats=request.formats
        )

        return {
            "message": "Diagrams generated successfully",
            "outputs": results
        }

    except Exception as e:
        return {"error": str(e)}
    


@router.get("/download")
def download_diagram(filename: str, dir: str = "./output/diagrams"):
    """
    Download a diagram file (e.g., .mmd or .svg).
    """
    file_path = os.path.join(dir, filename)

    if not os.path.exists(file_path):
        return {"error": f"File not found: {file_path}"}

    return FileResponse(
        file_path,
        media_type="application/octet-stream",
        filename=os.path.basename(file_path)
    )

