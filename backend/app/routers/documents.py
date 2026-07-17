from fastapi import APIRouter, UploadFile, File
from app.services import document_service
from app.models.schemas import DocumentOut

router = APIRouter(prefix="/api", tags=["documents"])


@router.post("/upload", response_model=DocumentOut)
async def upload_document(file: UploadFile = File(...)):
    return await document_service.ingest_document(file)


@router.get("/documents", response_model=list[DocumentOut])
def get_documents():
    return document_service.list_documents()


@router.delete("/documents/{document_id}")
def remove_document(document_id: str):
    document_service.delete_document(document_id)
    return {"status": "deleted", "id": document_id}
