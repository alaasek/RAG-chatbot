import uuid
import shutil
from datetime import datetime, timezone
from pathlib import Path
from fastapi import UploadFile, HTTPException

from app.config import UPLOAD_DIR
from app.database.db import db_session, row_to_dict
from app.rag import vector_store
from app.rag.chunking import chunk_pages
from app.utils.file_parser import parse_file

ALLOWED_TYPES = {"pdf", "docx", "md", "txt"}


def _extension(filename: str) -> str:
    return filename.rsplit(".", 1)[-1].lower() if "." in filename else ""


async def ingest_document(file: UploadFile) -> dict:
    file_type = _extension(file.filename)
    if file_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '.{file_type}'. Allowed: {sorted(ALLOWED_TYPES)}",
        )

    document_id = str(uuid.uuid4())
    dest_path: Path = UPLOAD_DIR / f"{document_id}.{file_type}"

    with dest_path.open("wb") as out:
        shutil.copyfileobj(file.file, out)

    size_bytes = dest_path.stat().st_size

    try:
        pages = parse_file(str(dest_path), file_type)

        chunks = chunk_pages(
            pages=pages,
            source=file.filename,
        )
        if not chunks:
            raise ValueError("No extractable text found in document.")
        vector_store.add_chunks(document_id, file.filename, chunks)
    except Exception as e:
        dest_path.unlink(missing_ok=True)
        raise HTTPException(status_code=422, detail=f"Failed to process document: {e}")

    uploaded_at = datetime.now(timezone.utc).isoformat()
    with db_session() as conn:
        conn.execute(
            """INSERT INTO documents
               (id, filename, file_type, size_bytes, num_pages, num_chunks, uploaded_at)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (document_id, file.filename, file_type, size_bytes, len(pages), len(chunks), uploaded_at),
        )

    return {
        "id": document_id,
        "filename": file.filename,
        "file_type": file_type,
        "size_bytes": size_bytes,
        "num_pages": len(pages),
        "num_chunks": len(chunks),
        "uploaded_at": uploaded_at,
    }


def list_documents() -> list[dict]:
    with db_session() as conn:
        rows = conn.execute("SELECT * FROM documents ORDER BY uploaded_at DESC").fetchall()
    return [row_to_dict(r) for r in rows]


def delete_document(document_id: str) -> None:
    with db_session() as conn:
        row = conn.execute("SELECT * FROM documents WHERE id = ?", (document_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Document not found")
        doc = row_to_dict(row)
        conn.execute("DELETE FROM documents WHERE id = ?", (document_id,))

    vector_store.delete_document(document_id)
    file_path = UPLOAD_DIR / f"{document_id}.{doc['file_type']}"
    file_path.unlink(missing_ok=True)
