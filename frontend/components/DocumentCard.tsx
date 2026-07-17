"use client";

import { FileText, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteDocument } from "@/lib/api";
import type { DocumentItem } from "@/types";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function DocumentCard({ doc }: { doc: DocumentItem }) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => deleteDocument(doc.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-bg-surface p-4">
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-bg-hover">
          <FileText className="h-4 w-4 text-flow" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-text-primary">
            {doc.filename}
          </p>
          <p className="font-mono text-xs text-text-muted">
            {formatDate(doc.uploaded_at)} · {formatBytes(doc.size_bytes)} ·{" "}
            {doc.num_pages ?? "?"} pages · {doc.num_chunks} chunks
          </p>
        </div>
      </div>
      <button
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
        className="rounded-lg p-2 text-text-muted hover:bg-bg-hover hover:text-red-400"
        aria-label={`Delete ${doc.filename}`}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
