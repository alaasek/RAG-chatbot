import axios from "axios";
import type {
  ChatResponse,
  ConversationSummary,
  DashboardStats,
  DocumentItem,
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

export async function fetchDashboard(): Promise<DashboardStats> {
  const { data } = await api.get<DashboardStats>("/api/dashboard");
  return data;
}

export async function fetchDocuments(): Promise<DocumentItem[]> {
  const { data } = await api.get<DocumentItem[]>("/api/documents");
  return data;
}

export async function uploadDocument(file: File): Promise<DocumentItem> {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post<DocumentItem>("/api/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function deleteDocument(id: string): Promise<void> {
  await api.delete(`/api/documents/${id}`);
}

export async function sendMessage(
  message: string,
  conversationId?: string
): Promise<ChatResponse> {
  const { data } = await api.post<ChatResponse>("/api/chat", {
    message,
    conversation_id: conversationId,
  });
  return data;
}

export async function fetchHistory(): Promise<ConversationSummary[]> {
  const { data } = await api.get<ConversationSummary[]>("/api/history");
  return data;
}

export async function fetchConversation(id: string) {
  const { data } = await api.get(`/api/history/${id}`);
  return data;
}

export async function deleteConversation(id: string): Promise<void> {
  await api.delete(`/api/history/${id}`);
}
