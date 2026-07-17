"use client";

import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { FileText } from "lucide-react";
import clsx from "clsx";
import type { ChatMessage } from "@/types";

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={clsx("flex", isUser ? "justify-end" : "justify-start")}
    >
      <div className={clsx("max-w-2xl", isUser ? "items-end" : "items-start")}>
        <div
          className={clsx(
            "rounded-2xl px-4 py-3 text-sm leading-relaxed",
            isUser
              ? "bg-flow text-bg"
              : "border border-border bg-bg-surface text-text-primary"
          )}
        >
          <div className="prose prose-invert prose-sm max-w-none prose-p:my-1.5 prose-pre:bg-bg prose-pre:border prose-pre:border-border">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        </div>

        {!isUser && message.sources?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5 border-l-2 border-amber/40 pl-3">
            {message.sources.map((s, i) => (
              <span
                key={i}
                title={s.snippet}
                className="flex items-center gap-1.5 rounded-full border border-amber/30 bg-amber/10 px-2.5 py-1 font-mono text-[11px] text-amber"
              >
                <FileText className="h-3 w-3" />
                {s.filename}
                {s.page ? ` · p.${s.page}` : ""}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
