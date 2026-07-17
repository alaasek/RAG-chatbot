from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class DocumentOut(BaseModel):
    id: str
    filename: str
    file_type: str
    size_bytes: int
    num_pages: Optional[int] = None
    num_chunks: int
    uploaded_at: datetime

    class Config:
        from_attributes = True


class SourceChunk(BaseModel):
    document_id: str
    filename: str
    page: Optional[int] = None
    chunk_index: int
    snippet: str


class ChatRequest(BaseModel):
    conversation_id: Optional[str] = None
    message: str = Field(..., min_length=1)


class ChatResponse(BaseModel):
    conversation_id: str
    answer: str
    sources: list[SourceChunk]
    response_time_ms: int


class MessageOut(BaseModel):
    id: str
    role: str
    content: str
    sources: list[SourceChunk] = []
    created_at: datetime


class ConversationOut(BaseModel):
    id: str
    title: str
    created_at: datetime
    updated_at: datetime
    messages: list[MessageOut] = []


class ConversationSummary(BaseModel):
    id: str
    title: str
    created_at: datetime
    updated_at: datetime
    message_count: int


class DashboardStats(BaseModel):
    total_documents: int
    total_chunks: int
    total_conversations: int
    total_questions: int
    storage_bytes: int
    avg_response_time_ms: float
