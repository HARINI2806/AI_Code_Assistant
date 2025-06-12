# api/visualizer_api.py

from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional
import os
from visualizer.diagram_generator import (
    generate_enhanced_class_diagram,
    generate_module_dependency_graph,
    generate_call_flow_diagram,
    generate_complexity_heatmap,
    generate_package_structure_diagram,
    # Legacy functions for backward compatibility
    generate_class_diagram,
    generate_dependency_graph
)

router = APIRouter()

class DiagramRequest(BaseModel):
    codebase_path: str = "./sample-codebase"
    include_private: bool = True
    max_complexity: Optional[int] = None

@router.post("/visualizer/class-diagram")
async def class_diagram(request: DiagramRequest = None):
    """Generate enhanced class diagram with methods and attributes."""
    if request is None:
        request = DiagramRequest()
    
    try:
        output_path = generate_enhanced_class_diagram(request.codebase_path)
        return {
            "message": "Enhanced class diagram generated successfully",
            "file": output_path,
            "type": "class_diagram"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating class diagram: {str(e)}")

@router.post("/visualizer/dependency-graph")
async def dependency_graph(request: DiagramRequest = None):
    """Generate module dependency graph."""
    if request is None:
        request = DiagramRequest()
    
    try:
        output_path = generate_module_dependency_graph(request.codebase_path)
        return {
            "message": "Module dependency graph generated successfully",
            "file": output_path,
            "type": "dependency_graph"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating dependency graph: {str(e)}")

@router.post("/visualizer/call-flow")
async def call_flow_diagram(request: DiagramRequest = None):
    """Generate function call flow diagram."""
    if request is None:
        request = DiagramRequest()
    
    try:
        output_path = generate_call_flow_diagram(request.codebase_path)
        return {
            "message": "Call flow diagram generated successfully",
            "file": output_path,
            "type": "call_flow"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating call flow diagram: {str(e)}")

@router.post("/visualizer/complexity-heatmap")
async def complexity_heatmap(request: DiagramRequest = None):
    """Generate complexity heatmap diagram."""
    if request is None:
        request = DiagramRequest()
    
    try:
        output_path = generate_complexity_heatmap(request.codebase_path)
        return {
            "message": "Complexity heatmap generated successfully",
            "file": output_path,
            "type": "complexity_heatmap"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating complexity heatmap: {str(e)}")

@router.post("/visualizer/package-structure")
async def package_structure(request: DiagramRequest = None):
    """Generate package structure diagram."""
    if request is None:
        request = DiagramRequest()
    
    try:
        output_path = generate_package_structure_diagram(request.codebase_path)
        return {
            "message": "Package structure diagram generated successfully",
            "file": output_path,
            "type": "package_structure"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating package structure diagram: {str(e)}")

@router.get("/visualizer/diagram-types")
async def get_diagram_types():
    """Get available diagram types and their descriptions."""
    return {
        "diagram_types": [
            {
                "id": "class",
                "name": "Enhanced Class Diagram",
                "description": "Shows classes with methods, attributes, and inheritance relationships",
                "endpoint": "/visualizer/class-diagram"
            },
            {
                "id": "dependency",
                "name": "Module Dependency Graph",
                "description": "Shows dependencies between modules and packages",
                "endpoint": "/visualizer/dependency-graph"
            },
            {
                "id": "call_flow",
                "name": "Function Call Flow",
                "description": "Shows function call relationships and flow",
                "endpoint": "/visualizer/call-flow"
            },
            {
                "id": "complexity",
                "name": "Complexity Heatmap",
                "description": "Visual representation of code complexity metrics",
                "endpoint": "/visualizer/complexity-heatmap"
            },
            {
                "id": "package",
                "name": "Package Structure",
                "description": "Shows the directory and package structure",
                "endpoint": "/visualizer/package-structure"
            }
        ]
    }

@router.get("/visualizer/download")
async def download_diagram(file: str = Query(..., description="Filename in output/diagrams/")):
    """Download generated diagram file."""
    full_path = f"output/diagrams/{file}"
    
    if not os.path.exists(full_path):
        raise HTTPException(status_code=404, detail="Diagram file not found")
    
    filename = os.path.basename(full_path)
    return FileResponse(
        full_path, 
        media_type="text/plain", 
        filename=filename,
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/visualizer/list")
async def list_diagrams():
    """List all generated diagram files."""
    diagram_dir = "output/diagrams"
    if not os.path.exists(diagram_dir):
        return {"diagrams": []}
    
    files = []
    for filename in os.listdir(diagram_dir):
        if filename.endswith('.mmd'):
            file_path = os.path.join(diagram_dir, filename)
            file_stats = os.stat(file_path)
            files.append({
                "filename": filename,
                "size": file_stats.st_size,
                "modified": file_stats.st_mtime,
                "download_url": f"/api/visualizer/download?file={filename}"
            })
    
    return {"diagrams": files}

# Legacy endpoints for backward compatibility
@router.post("/visualizer/legacy/class-diagram")
async def legacy_class_diagram(codebase_path: str = "./sample-codebase"):
    """Legacy class diagram endpoint (simplified version)."""
    output_path = generate_class_diagram(codebase_path)
    return {"message": "Class diagram generated", "file": output_path}

@router.post("/visualizer/legacy/dependency-graph")
async def legacy_dependency_graph(codebase_path: str = "./sample-codebase"):
    """Legacy dependency graph endpoint."""
    output_path = generate_dependency_graph(codebase_path)
    return {"message": "Dependency graph generated", "file": output_path}