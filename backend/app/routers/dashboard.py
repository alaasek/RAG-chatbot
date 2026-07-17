from fastapi import APIRouter
from app.database.db import db_session
from app.rag import vector_store
from app.models.schemas import DashboardStats

router = APIRouter(prefix="/api", tags=["dashboard"])


@router.get("/dashboard", response_model=DashboardStats)
def get_dashboard():
    with db_session() as conn:
        total_documents = conn.execute("SELECT COUNT(*) c FROM documents").fetchone()["c"]
        storage_bytes = conn.execute("SELECT COALESCE(SUM(size_bytes), 0) s FROM documents").fetchone()["s"]
        total_conversations = conn.execute("SELECT COUNT(*) c FROM conversations").fetchone()["c"]
        total_questions = conn.execute("SELECT COUNT(*) c FROM messages WHERE role = 'user'").fetchone()["c"]
        avg_time = conn.execute(
            "SELECT COALESCE(AVG(response_time_ms), 0) a FROM messages WHERE role = 'assistant'"
        ).fetchone()["a"]

    return {
        "total_documents": total_documents,
        "total_chunks": vector_store.total_vectors(),
        "total_conversations": total_conversations,
        "total_questions": total_questions,
        "storage_bytes": storage_bytes,
        "avg_response_time_ms": round(avg_time, 1),
    }
