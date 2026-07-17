"""Extracts raw text (with page numbers where applicable) from uploaded files."""
from dataclasses import dataclass


@dataclass
class Page:
    number: int
    text: str


def parse_file(path: str, file_type: str) -> list[Page]:
    if file_type == "pdf":
        return _parse_pdf(path)
    if file_type == "docx":
        return _parse_docx(path)
    if file_type in ("md", "txt"):
        return _parse_plain_text(path)
    raise ValueError(f"Unsupported file type: {file_type}")


def _parse_pdf(path: str) -> list[Page]:
    from pypdf import PdfReader

    reader = PdfReader(path)
    pages = []
    for i, page in enumerate(reader.pages, start=1):
        text = page.extract_text() or ""
        if text.strip():
            pages.append(Page(number=i, text=text))
    return pages


def _parse_docx(path: str) -> list[Page]:
    import docx

    document = docx.Document(path)
    full_text = "\n".join(p.text for p in document.paragraphs if p.text.strip())
    # DOCX has no native page concept outside a rendering engine, so we
    # treat the whole document as a single logical "page".
    return [Page(number=1, text=full_text)]


def _parse_plain_text(path: str) -> list[Page]:
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        text = f.read()
    return [Page(number=1, text=text)]
