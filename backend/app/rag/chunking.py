from dataclasses import dataclass
from uuid import uuid4

from app.config import CHUNK_SIZE, CHUNK_OVERLAP
from app.utils.file_parser import Page


@dataclass
class Chunk:
    id: str
    text: str
    page: int
    chunk_index: int
    source: str


def clean_text(text: str) -> str:
    """Remove empty lines and normalize whitespace."""
    lines = [line.strip() for line in text.splitlines()]
    lines = [line for line in lines if line]
    return "\n".join(lines)


def chunk_pages(
    pages: list[Page],
    source: str,
    chunk_size: int = CHUNK_SIZE,
    overlap: int = CHUNK_OVERLAP,
) -> list[Chunk]:
    """
    Split document pages into overlapping character chunks.

    Args:
        pages: Parsed pages from the document.
        source: Original document filename.
        chunk_size: Maximum characters per chunk.
        overlap: Number of overlapping characters.

    Returns:
        List[Chunk]
    """
    chunks: list[Chunk] = []
    chunk_index = 0

    for page in pages:
        text = clean_text(page.text)

        if not text:
            continue

        start = 0

        while start < len(text):
            end = min(start + chunk_size, len(text))
            piece = text[start:end].strip()

            if piece:
                chunks.append(
                    Chunk(
                        id=str(uuid4()),
                        text=piece,
                        page=page.number,
                        chunk_index=chunk_index,
                        source=source,
                    )
                )
                chunk_index += 1

            if end >= len(text):
                break

            start = end - overlap

    return chunks