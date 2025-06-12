# summarizer/summary_generator.py

import os
import asyncio
import aiofiles
from openai import AsyncOpenAI
from langchain.text_splitter import RecursiveCharacterTextSplitter
import difflib

SUPPORTED_EXTENSIONS = [".py", ".js", ".java"]
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
CHUNK_SIZE = 800
CHUNK_OVERLAP = 100

client = AsyncOpenAI(api_key=OPENAI_API_KEY)

def collect_code_files(codebase_path: str):
    files = []
    for root, _, filenames in os.walk(codebase_path):
        for file in filenames:
            if os.path.splitext(file)[1] in SUPPORTED_EXTENSIONS:
                files.append(os.path.join(root, file))
    return files

def chunk_code(content: str):
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP
    )
    return splitter.split_text(content)

async def summarize_chunk(chunk: str) -> str:
    system_prompt = (
        "You are an expert software engineer. Summarize the following code as if writing a tutorial for a beginner."
    )
    response = await client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": chunk},
        ],
        stream=True,
    )

    summary = ""
    async for part in response:
        delta = part.choices[0].delta.content or ""
        summary += delta
    return summary.strip()

async def summarize_file(file_path: str) -> str:
    async with aiofiles.open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        content = await f.read()

    chunks = chunk_code(content)
    file_summary = f"### Summary for `{os.path.basename(file_path)}`\n\n"
    for chunk in chunks:
        summary = await summarize_chunk(chunk)
        file_summary += f"- {summary}\n"
    return file_summary

async def generate_summaries(path: str) -> str:
    if os.path.isfile(path):
        return await summarize_file(path)

    if os.path.isdir(path):
        files = collect_code_files(path)
        if not files:
            return "No supported code files found."

        all_summaries = "# Codebase Tutorial Summary\n\n"
        for f in files:
            summary = await summarize_file(f)
            all_summaries += summary + "\n\n"
        return all_summaries

    raise ValueError(f"Path '{path}' is neither a file nor a folder.")

def compute_diff(original: str, modified: str) -> str:
    original_lines = original.splitlines(keepends=True)
    modified_lines = modified.splitlines(keepends=True)
    diff = difflib.unified_diff(original_lines, modified_lines, fromfile='original', tofile='modified')
    return ''.join(diff)

async def generate_impact_summary(modified_code: str, original_code: str | None = None) -> str:
    if original_code:
        diff = compute_diff(original_code, modified_code)
        prompt = (
            "The following diff shows changes made to code in a software system.\n\n"
            f"{diff}\n\n"
            "Explain the impact of these changes on the system’s business logic. Be concise and specific."
        )
    else:
        prompt = (
            "Analyze the following code and describe what business logic it implements.\n\n"
            f"{modified_code}"
        )

    res = await client.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
    )

    return res.choices[0].message.content.strip()