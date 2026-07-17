from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import CORS_ORIGINS
from app.database.db import init_db
from app.routers import documents, chat, dashboard

app = FastAPI(
    title="KnowFlow AI API",
    description="RAG backend: upload documents, index them, ask grounded questions.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "knowflow-ai-backend"}

@app.get("/")
def root():
    return {
        "message": "Welcome to KnowFlow AI API",
        "docs": "/docs",
        "health": "/api/health",
        "version": "0.1.0",
    }


app.include_router(documents.router)
app.include_router(chat.router)
app.include_router(dashboard.router)
