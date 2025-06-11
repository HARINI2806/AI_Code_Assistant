from fastapi import APIRouter
from pydantic import BaseModel
from executor.executor import run_function_from_codebase

router = APIRouter()

class ExecutionRequest(BaseModel):
    codebase_path: str = "./sample-codebase"
    function_name: str
    params: list = []  # parameters to pass to the function

@router.post("/run")
def execute_function(request: ExecutionRequest):
    """
    Run a specified function from the codebase with optional parameters.
    """
    try:
        output = run_function_from_codebase(
            codebase_path=request.codebase_path,
            function_name=request.function_name,
            args=request.params
        )
        return {"result": output}
    except Exception as e:
        return {"error": str(e)}
