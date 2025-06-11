from fastapi import APIRouter
from pydantic import BaseModel
from retriever.retriever import retrieve_code_chunks
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()
llm = ChatOpenAI(model="gpt-4", temperature=0.3)

class QARequest(BaseModel):
    question: str
    top_k: int = 5


@router.post("/ask")
def ask_question(request: QARequest):
    """
    Answer a question using retrieved code chunks and LLM.
    """
    try:
        # Step 1: Retrieve chunks
        chunks = retrieve_code_chunks(request.question, top_k=request.top_k)
        context = "\n\n".join([c['text'] for c in chunks])

        # Step 2: Prompt LLM
        prompt = (
            f"You are an AI code assistant. Use the following code context to answer the question.\n\n"
            f"Code Context:\n{context}\n\n"
            f"Question: {request.question}\n\n"
            f"Answer:"
        )
        response = llm.invoke(prompt)

        return {"answer": response.content}

    except Exception as e:
        return {"error": str(e)}
