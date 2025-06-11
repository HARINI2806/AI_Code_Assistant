# qa/qa.py

import os
from openai import OpenAI
from retriever.retriever import retrieve_code_chunks

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=OPENAI_API_KEY)

SYSTEM_PROMPT = """You are a senior software engineer. Use the provided context from a codebase to answer user questions clearly and accurately."""

def build_prompt(context_chunks: list[str], question: str) -> list[dict]:
    context_text = "\n\n".join(context_chunks)
    return [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": f"Context:\n{context_text}\n\nQuestion: {question}"},
    ]

def answer_question(question: str, k: int = 5) -> str:
    chunks = retrieve_code_chunks(question, k=k)
    if not chunks:
        return "No relevant code found to answer the question."

    messages = build_prompt(chunks, question)
    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=messages
    )
    return response.choices[0].message.content.strip()
