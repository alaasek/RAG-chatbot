"""Thin wrapper around ChromaDB so the rest of the app never imports it
directly. Swapping the vector DB later (e.g. pgvector, Qdrant) only
means rewriting this file.
"""
import chromadb
from chromadb.utils import embedding_functions
from app.config import CHROMA_DIR, EMBEDDING_MODEL, TOP_K

_client = chromadb.PersistentClient(path=str(CHROMA_DIR))

_embedding_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name=EMBEDDING_MODEL
)

_collection = _client.get_or_create_collection(
    name="knowflow_documents",
    embedding_function=_embedding_fn,
    metadata={"hnsw:space": "cosine"},
)


def add_chunks(document_id: str, filename: str, chunks: list) -> None:
    if not chunks:
        return
    _collection.add(
        ids=[c.id for c in chunks],
        documents=[c.text for c in chunks],
        metadatas=[
        {
            "document_id": document_id,
            "filename": filename,
            "source": c.source,
            "page": c.page,
            "chunk_index": c.chunk_index,
        }
            for c in chunks
        ],
    )


def query(text: str, top_k: int = TOP_K, document_ids: list[str] | None = None) -> list[dict]:
    where = {"document_id": {"$in": document_ids}} if document_ids else None
    results = _collection.query(
        query_texts=[text],
        n_results=top_k,
        where=where,
    )
    if not results["ids"] or not results["ids"][0]:
        return []
    out = []
    for i in range(len(results["ids"][0])):
        out.append(
            {
                "text": results["documents"][0][i],
                "metadata": results["metadatas"][0][i],
                "distance": results["distances"][0][i],
            }
        )
    return out


def delete_document(document_id: str) -> None:
    _collection.delete(where={"document_id": document_id})


def total_vectors() -> int:
    return _collection.count()
