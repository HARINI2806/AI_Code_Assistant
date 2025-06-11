from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import all routers
from api.routes import embedder, docstring, executor, pdf, qa, retriever, summarizer, summary, visualizer

app = FastAPI(
    title="AI Code Assistant API",
    description="Backend service for code analysis, docstring generation, QA, summaries, and more.",
    version="1.0.0"
)

# CORS settings if using frontend (Streamlit, etc.)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all routes
app.include_router(embedder.router, prefix="/embedder", tags=["Embedder"])
app.include_router(retriever.router, prefix="/retriever", tags=["Retriever"])
app.include_router(qa.router, prefix="/qa", tags=["Question Answering"])
app.include_router(pdf.router, prefix="/pdf", tags=["PDF Generator"])
app.include_router(executor.router, prefix="/executor", tags=["Executor"])
app.include_router(visualizer.router, prefix="/visualizer", tags=["Code Visualizer"])
app.include_router(docstring.router, prefix="/docstring", tags=["Docstring Generator"])
app.include_router(summary.router, prefix="/summary", tags=["Summary Generator"])

@app.get("/")
def root():
    return {"message": "Welcome to the AI Code Assistant API"}
