from fastapi import APIRouter
from pydantic import BaseModel
from retriever.retriever import retrieve_relevant_chunks

router = APIRouter()


class QueryRequest(BaseModel):
    query: str
    top_k: int = 5


@router.post("/search")
def retrieve_chunks(request: QueryRequest):
    """
    Retrieve top-k relevant code/documentation chunks for a query.
    """
    try:
        results = retrieve_relevant_chunks(request.query, top_k=request.top_k)
        return {"results": results}
    except Exception as e:
        return {"error": str(e)}
