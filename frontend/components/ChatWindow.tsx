"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Send, Loader2, MessageSquare } from "lucide-react";
import { sendMessage, fetchConversation } from "@/lib/api";
import { MessageBubble } from "@/components/MessageBubble";
import { EmptyState } from "@/components/EmptyState";
import type { ChatMessage } from "@/types";

export function ChatWindow({ conversationId }: { conversationId?: string }) {
  const [input, setInput] = useState("");
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const [activeConversationId, setActiveConversationId] = useState(
    conversationId
  );
  const bottomRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: conversation } = useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: () => fetchConversation(conversationId!),
    enabled: !!conversationId,
  });

  useEffect(() => {
    if (conversation?.messages) {
      setLocalMessages(conversation.messages);
      setActiveConversationId(conversation.id);
    }
  }, [conversation]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages]);

  const mutation = useMutation({
    mutationFn: (message: string) =>
      sendMessage(message, activeConversationId),
    onMutate: (message) => {
      setLocalMessages((prev) => [
        ...prev,
        {
          id: `temp-${Date.now()}`,
          role: "user",
          content: message,
          sources: [],
          created_at: new Date().toISOString(),
        },
      ]);
      setInput("");
    },
    onSuccess: (res) => {
      setActiveConversationId(res.conversation_id);
      setLocalMessages((prev) => [
        ...prev,
        {
          id: `temp-${Date.now()}-a`,
          role: "assistant",
          content: res.answer,
          sources: res.sources,
          created_at: new Date().toISOString(),
        },
      ]);
      queryClient.invalidateQueries({ queryKey: ["history"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || mutation.isPending) return;
    mutation.mutate(trimmed);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto scrollbar-thin px-8 py-6">
        {localMessages.length === 0 ? (
          <div className="mx-auto max-w-lg pt-16">
            <EmptyState
              icon={MessageSquare}
              title="Ask your documents anything"
              description="Every answer is grounded in what you've uploaded, with the source document and page cited inline."
            />
          </div>
        ) : (
          <div className="mx-auto flex max-w-2xl flex-col gap-5">
            {localMessages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}
            {mutation.isPending && (
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Retrieving relevant chunks and generating an answer…
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-t border-border bg-bg px-8 py-4"
      >
        <div className="mx-auto flex max-w-2xl items-center gap-2 rounded-xl border border-border bg-bg-surface px-3 py-2 focus-within:border-flow/60">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about your documents…"
            className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || mutation.isPending}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-flow text-bg disabled:opacity-40"
            aria-label="Send message"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
}
