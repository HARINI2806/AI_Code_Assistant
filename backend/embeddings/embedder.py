# backend/embeddings/embedder.py

from loader import load_code_files
from chunker import chunk_code
from langchain.vectorstores import Chroma
from langchain.embeddings import OpenAIEmbeddings
from langchain.docstore.document import Document
import os
from dotenv import load_dotenv

load_dotenv()

def embed_codebase(codebase_path: str, persist_dir: str = "./data/vectorstore"):
    files = load_code_files(codebase_path)
    documents = []

    for path in files:
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
            chunks = chunk_code(content)

            for chunk in chunks:
                documents.append(Document(page_content=chunk, metadata={"source": path}))

    embedding_model = OpenAIEmbeddings(model="text-embedding-3-small")
    vectordb = Chroma.from_documents(
        documents=documents,
        embedding=embedding_model,
        persist_directory=persist_dir
    )

    vectordb.persist()
    print(f"[✔] Embedded {len(documents)} chunks from {len(files)} files.")

if __name__ == "__main__":
    embed_codebase("your/codebase/path")
