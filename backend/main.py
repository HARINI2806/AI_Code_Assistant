# main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import (
    embedder_api,
    retriever_api,
    qa_api,
    pdf_api,
    executor_api,
    visualizer_api,
    docstring_api,
    summarizer_api
)

app = FastAPI(
    title="AI Code Assistant",
    description="An intelligent assistant that analyzes, summarizes, visualizes, and interacts with codebases.",
    version="1.0.0"
)

# CORS Middleware for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can restrict this to frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(embedder_api.router, prefix="/embed", tags=["Embedder"])
app.include_router(retriever_api.router, prefix="/retrieve", tags=["Retriever"])
app.include_router(qa_api.router, prefix="/qa", tags=["Question Answering"])
app.include_router(pdf_api.router, prefix="/pdf", tags=["PDF Generator"])
app.include_router(executor_api.router, prefix="/execute", tags=["Executor"])
app.include_router(visualizer_api.router, prefix="/visualizer", tags=["Visualizer"])
app.include_router(docstring_api.router, prefix="/docstring", tags=["Docstring Generator"])
app.include_router(summarizer_api.router, prefix="/summary", tags=["Summarizer"])

@app.get("/")
def root():
    return {"message": "AI Code Assistant backend is running 🚀"}