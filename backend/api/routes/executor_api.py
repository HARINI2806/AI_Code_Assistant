# executor/executor_api.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from executor.runner import run_function_from_codebase

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
