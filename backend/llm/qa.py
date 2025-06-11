# backend/llm/qa.py

import os
from dotenv import load_dotenv
from langchain.chat_models import ChatOpenAI
from langchain.chains.qa_with_sources import load_qa_with_sources_chain

from embeddings.retriever import retrieve_code_chunks

load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# 1. Set up the LLM
llm = ChatOpenAI(
    temperature=0,
    openai_api_key=OPENAI_API_KEY,
    model_name="gpt-4",  # Or use gpt-3.5-turbo for speed
)

# 2. QA Chain: Given context + question → get answer
qa_chain = load_qa_with_sources_chain(llm, chain_type="stuff")


def answer_question(question: str, k: int = 5) -> dict:
    """
    Retrieve relevant code chunks and answer the given question using an LLM.

    Returns:
        {
            "answer": "...",
            "sources": ["path/to/file1.py", "path/to/file2.js"]
        }
    """
    retrieved = retrieve_code_chunks(question, k=k)

    if not retrieved:
        return {
            "answer": "Sorry, I couldn’t find anything relevant in the codebase.",
            "sources": []
        }

    documents = [
        {"page_content": content, "metadata": meta}
        for content, meta in retrieved
    ]

    response = qa_chain(
        {"input_documents": documents, "question": question},
        return_only_outputs=True
    )

    return {
        "answer": response["output_text"],
        "sources": list({doc["metadata"]["source"] for doc in documents})
    }
