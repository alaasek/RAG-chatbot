from fastapi import APIRouter, HTTPException
from app.services import rag_service
from app.models.schemas import ChatRequest, ChatResponse, ConversationOut, ConversationSummary

router = APIRouter(prefix="/api", tags=["chat"])


@router.post("/chat", response_model=ChatResponse)
def chat(payload: ChatRequest):
    return rag_service.ask(payload.conversation_id, payload.message)


@router.get("/history", response_model=list[ConversationSummary])
def history():
    return rag_service.list_conversations()


@router.get("/history/{conversation_id}", response_model=ConversationOut)
def get_conversation(conversation_id: str):
    conv = rag_service.get_conversation(conversation_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conv


@router.patch("/history/{conversation_id}")
def rename_conversation(conversation_id: str, title: str):
    rag_service.rename_conversation(conversation_id, title)
    return {"status": "renamed"}


@router.delete("/history/{conversation_id}")
def delete_conversation(conversation_id: str):
    rag_service.delete_conversation(conversation_id)
    return {"status": "deleted"}
