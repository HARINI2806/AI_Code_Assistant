import os
import asyncio
from typing import List, Dict
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import ChatOpenAI
from backend.embedder.embedder import load_code_files
from dotenv import load_dotenv

load_dotenv()

SUPPORTED_LANG_EXTENSIONS = {
    ".py": "python",
    ".js": "javascript",
    ".java": "java"
}

llm = ChatOpenAI(model="gpt-4", temperature=0.2)

def detect_language(filepath: str) -> str:
    for ext, lang in SUPPORTED_LANG_EXTENSIONS.items():
        if filepath.endswith(ext):
            return lang
    return "plaintext"

async def generate_summary_stream(code_chunk: str, language: str) -> str:
    prompt = (
        f"Summarize the following {language} code to help users understand it in a tutorial-like way:\n\n"
        f"```{language}\n{code_chunk}\n```"
    )
    response = await llm.ainvoke(prompt)
    return response.content

async def generate_summaries(codebase_path: str, max_tokens: int = 800) -> List[Dict]:
    summaries = []
    files = load_code_files(codebase_path)
    splitter = RecursiveCharacterTextSplitter(chunk_size=max_tokens, chunk_overlap=50)

    tasks = []

    for file_path, code in files:
        if not code.strip():
            continue
        language = detect_language(file_path)
        chunks = splitter.split_text(code)

        for i, chunk in enumerate(chunks):
            tasks.append(asyncio.create_task(
                summarize_chunk(file_path, chunk, language, i)
            ))

    return await asyncio.gather(*tasks)

async def summarize_chunk(file_path: str, chunk: str, language: str, index: int) -> Dict:
    try:
        summary = await generate_summary_stream(chunk, language)
        return {
            "file": file_path,
            "chunk_index": index,
            "language": language,
            "summary": summary
        }
    except Exception as e:
        return {
            "file": file_path,
            "chunk_index": index,
            "language": language,
            "summary": f"[ERROR]: {str(e)}"
        }
