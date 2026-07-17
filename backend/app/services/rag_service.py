import time
import uuid
from datetime import datetime, timezone

from app.database.db import db_session, row_to_dict, dumps, loads
from app.rag import vector_store
from app.rag.llm import generate_answer


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _ensure_conversation(conn, conversation_id: str | None, first_message: str) -> str:
    if conversation_id:
        row = conn.execute("SELECT id FROM conversations WHERE id = ?", (conversation_id,)).fetchone()
        if row:
            return conversation_id

    new_id = conversation_id or str(uuid.uuid4())
    title = (first_message[:50] + "…") if len(first_message) > 50 else first_message
    now = _now()
    conn.execute(
        "INSERT INTO conversations (id, title, created_at, updated_at) VALUES (?, ?, ?, ?)",
        (new_id, title, now, now),
    )
    return new_id


def ask(conversation_id: str | None, message: str) -> dict:
    start = time.perf_counter()

    try:
        results = vector_store.query(message)
    except Exception as e:
        return {
            "error": "Vector search failed.",
            "details": str(e),
        }
    answer = (
        generate_answer(message, results)
        if results
        else "I couldn't find any relevant information in the uploaded documents."
    )

    MAX_SNIPPET = 220

    sources = [
        {
            "document_id": r["metadata"]["document_id"],
            "filename": r["metadata"]["filename"],
            "page": r["metadata"].get("page"),
            "chunk_index": r["metadata"]["chunk_index"],
            "score": round(1 - r["distance"], 3),
            "snippet": (
                r["text"][:MAX_SNIPPET] + "..."
                if len(r["text"]) > MAX_SNIPPET
                else r["text"]
            ),
        }
        for r in results
    ]

    elapsed_ms = int((time.perf_counter() - start) * 1000)
    retrieved_chunks = len(results)

    with db_session() as conn:
        conv_id = _ensure_conversation(conn, conversation_id, message)

        conn.execute(
            """INSERT INTO messages (id, conversation_id, role, content, sources, response_time_ms, created_at)
               VALUES (?, ?, 'user', ?, NULL, NULL, ?)""",
            (str(uuid.uuid4()), conv_id, message, _now()),
        )
        conn.execute(
            """INSERT INTO messages (id, conversation_id, role, content, sources, response_time_ms, created_at)
               VALUES (?, ?, 'assistant', ?, ?, ?, ?)""",
            (str(uuid.uuid4()), conv_id, answer, dumps(sources), elapsed_ms, _now()),
        )
        conn.execute(
            "UPDATE conversations SET updated_at = ? WHERE id = ?", (_now(), conv_id)
        )

    return {
        "conversation_id": conv_id,
        "answer": answer,
        "sources": sources,
        "response_time_ms": elapsed_ms,
        "retrieved_chunks": retrieved_chunks,
    }


def list_conversations() -> list[dict]:
    with db_session() as conn:
        rows = conn.execute(
            """SELECT c.*, COUNT(m.id) as message_count
               FROM conversations c LEFT JOIN messages m ON m.conversation_id = c.id
               GROUP BY c.id ORDER BY c.updated_at DESC"""
        ).fetchall()
    return [row_to_dict(r) for r in rows]


def get_conversation(conversation_id: str) -> dict | None:
    with db_session() as conn:
        conv = conn.execute("SELECT * FROM conversations WHERE id = ?", (conversation_id,)).fetchone()
        if not conv:
            return None
        msgs = conn.execute(
            "SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC",
            (conversation_id,),
        ).fetchall()

    conv_dict = row_to_dict(conv)
    conv_dict["messages"] = [
        {**row_to_dict(m), "sources": loads(m["sources"])} for m in msgs
    ]
    return conv_dict


def rename_conversation(conversation_id: str, title: str) -> None:
    with db_session() as conn:
        conn.execute(
            "UPDATE conversations SET title = ?, updated_at = ? WHERE id = ?",
            (title, _now(), conversation_id),
        )


def delete_conversation(conversation_id: str) -> None:
    with db_session() as conn:
        conn.execute("DELETE FROM messages WHERE conversation_id = ?", (conversation_id,))
        conn.execute("DELETE FROM conversations WHERE id = ?", (conversation_id,))
