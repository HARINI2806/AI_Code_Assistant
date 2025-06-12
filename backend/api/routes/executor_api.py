# executor/executor_api.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from executor.runner import run_function_from_codebase, find_runnable_python_files
import os

router = APIRouter()

class ExecuteRequest(BaseModel):
    codebase_path: str = "./sample-codebase"
    function_name: str
    args: list = []
    kwargs: dict = {}

@router.post("/execute")
async def execute_function(req: ExecuteRequest):
    if not req.function_name:
        raise HTTPException(status_code=400, detail="Function name is required.")

    try:
        result = run_function_from_codebase(
            req.codebase_path, req.function_name, req.args, req.kwargs
        )
        return {"output": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/runnable-files")
async def get_runnable_files():
    """Get list of runnable Python files (directories with main.py)"""
    try:
        base_path = "./sample-codebase"
        runnable_files = find_runnable_python_files(base_path)
        return {"runnable_files": runnable_files}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error finding runnable files: {str(e)}")