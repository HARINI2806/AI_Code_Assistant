# embedder/embedder.py

import os
from langchain.vectorstores import Chroma
from langchain.embeddings import OpenAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema import Document
from dotenv import load_dotenv

load_dotenv()

SUPPORTED_EXTENSIONS = [".py", ".js", ".java"]
DEFAULT_CODEBASE_DIR = "./sample-codebase"
CHROMA_PATH = "chroma_db"
EMBEDDING_MODEL_NAME = "text-embedding-3-small"

# Initialize embedding function
embedding_function = OpenAIEmbeddings(model=EMBEDDING_MODEL_NAME)

def collect_code_files(directory):
    code_files = []
    for root, _, files in os.walk(directory):
        for file in files:
            if os.path.splitext(file)[1] in SUPPORTED_EXTENSIONS:
                code_files.append(os.path.join(root, file))
    return code_files

def load_documents_from_files(files):
    documents = []
    for path in files:
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
        metadata = {"source": path}
        documents.append(Document(page_content=content, metadata=metadata))
    return documents

def chunk_documents(documents, chunk_size=500, chunk_overlap=50):
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap
    )
    return splitter.split_documents(documents)

def embed_codebase(codebase_path=None):
    codebase_path = codebase_path or DEFAULT_CODEBASE_DIR
    code_files = collect_code_files(codebase_path)
    if not code_files:
        raise ValueError(f"No supported code files found in: {codebase_path}")
    
    docs = load_documents_from_files(code_files)
    chunks = chunk_documents(docs)

    vectorstore = Chroma.from_documents(
        documents=chunks,
        embedding=embedding_function,
        persist_directory=CHROMA_PATH
    )
    vectorstore.persist()
    return {"status": "success", "chunks_indexed": len(chunks)}

