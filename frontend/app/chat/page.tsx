"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ChatWindow } from "@/components/ChatWindow";

function ChatPageInner() {
  const params = useSearchParams();
  const conversationId = params.get("c") ?? undefined;
  return <ChatWindow key={conversationId} conversationId={conversationId} />;
}

export default function ChatPage() {
  return (
    <Suspense fallback={null}>
      <ChatPageInner />
    </Suspense>
  );
}
