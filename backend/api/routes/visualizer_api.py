# api/visualizer_api.py

from fastapi import APIRouter, Query
from fastapi.responses import FileResponse
from visualizer.diagram_generator import (
    generate_class_diagram,
    generate_dependency_graph
)

router = APIRouter()

@router.post("/visualizer/class-diagram")
async def class_diagram(codebase_path: str = "./sample-codebase"):
    output_path = generate_class_diagram(codebase_path)
    return {"message": "Class diagram generated", "file": output_path}

@router.post("/visualizer/dependency-graph")
async def dependency_graph(codebase_path: str = "./sample-codebase"):
    output_path = generate_dependency_graph(codebase_path)
    return {"message": "Dependency graph generated", "file": output_path}

@router.get("/visualizer/download")
async def download_diagram(file: str = Query(..., description="Filename in output/diagrams/")):
    full_path = f"output/diagrams/{file}"
    return FileResponse(full_path, media_type="text/plain", filename=file)
