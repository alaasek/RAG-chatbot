"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, FileStack } from "lucide-react";
import { fetchDocuments } from "@/lib/api";
import { DocumentCard } from "@/components/DocumentCard";
import { UploadModal } from "@/components/UploadModal";
import { EmptyState } from "@/components/EmptyState";

export default function DocumentsPage() {
  const [uploadOpen, setUploadOpen] = useState(false);
  const { data: documents, isLoading } = useQuery({
    queryKey: ["documents"],
    queryFn: fetchDocuments,
  });

  return (
    <div className="mx-auto max-w-3xl px-8 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Documents
        </h1>
        <button
          onClick={() => setUploadOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-flow px-4 py-2 text-sm font-medium text-bg hover:bg-flow/90"
        >
          <Plus className="h-4 w-4" />
          Upload
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-[68px] animate-pulse rounded-xl border border-border bg-bg-surface"
            />
          ))}
        </div>
      ) : documents?.length ? (
        <div className="flex flex-col gap-3">
          {documents.map((doc) => (
            <DocumentCard key={doc.id} doc={doc} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FileStack}
          title="No documents yet"
          description="Upload a PDF, DOCX, Markdown, or TXT file to start building your knowledge base."
          action={
            <button
              onClick={() => setUploadOpen(true)}
              className="mt-2 rounded-lg bg-flow px-4 py-2 text-sm font-medium text-bg hover:bg-flow/90"
            >
              Upload your first document
            </button>
          }
        />
      )}

      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} />
    </div>
  );
}
