# retriever/retriever.py

import os
from langchain.vectorstores import Chroma
from langchain.embeddings import OpenAIEmbeddings

CHROMA_PATH = "chroma_db"
EMBEDDING_MODEL_NAME = "text-embedding-3-small"

# Load embedding model
embedding_function = OpenAIEmbeddings(model=EMBEDDING_MODEL_NAME)

# Load vectorstore from disk
def get_vectorstore():
    if not os.path.exists(CHROMA_PATH):
        raise FileNotFoundError(f"Chroma DB not found at: {CHROMA_PATH}. Run embedder first.")
    return Chroma(persist_directory=CHROMA_PATH, embedding_function=embedding_function)

# Retrieve top-k relevant code chunks
def retrieve_code_chunks(query: str, k: int = 5):
    vectorstore = get_vectorstore()
    results = vectorstore.similarity_search(query, k=k)
    return [doc.page_content for doc in results]
