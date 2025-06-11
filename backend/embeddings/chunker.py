# backend/embeddings/chunker.py

from typing import List, Dict
import tiktoken

def chunk_code(content: str, max_tokens: int = 500, overlap: int = 50) -> List[str]:
    encoding = tiktoken.get_encoding("cl100k_base")
    tokens = encoding.encode(content)

    chunks = []
    start = 0
    while start < len(tokens):
        end = start + max_tokens
        chunk = tokens[start:end]
        decoded = encoding.decode(chunk)
        chunks.append(decoded)
        start += max_tokens - overlap

    return chunks
