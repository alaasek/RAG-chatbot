export interface DocumentItem {
  id: string;
  filename: string;
  file_type: string;
  size_bytes: number;
  num_pages: number | null;
  num_chunks: number;
  uploaded_at: string;
}

export interface SourceChunk {
  document_id: string;
  filename: string;
  page: number | null;
  chunk_index: number;
  snippet: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources: SourceChunk[];
  created_at: string;
}

export interface ChatResponse {
  conversation_id: string;
  answer: string;
  sources: SourceChunk[];
  response_time_ms: number;
}

export interface ConversationSummary {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: number;
}

export interface DashboardStats {
  total_documents: number;
  total_chunks: number;
  total_conversations: number;
  total_questions: number;
  storage_bytes: number;
  avg_response_time_ms: number;
}
