"use client";

import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { UploadCloud, X, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadDocument } from "@/lib/api";

const ACCEPTED = [".pdf", ".docx", ".md", ".txt"];

export function UploadModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: uploadDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      onClose();
    },
    onError: (err: any) => {
      setError(
        err?.response?.data?.detail ?? "Upload failed. Please try again."
      );
    },
  });

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const file = files[0];
      const ext = "." + file.name.split(".").pop()?.toLowerCase();
      if (!ACCEPTED.includes(ext)) {
        setError(`Unsupported file type. Allowed: ${ACCEPTED.join(", ")}`);
        return;
      }
      setError(null);
      mutation.mutate(file);
    },
    [mutation]
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-md rounded-2xl border border-border bg-bg-surface p-6"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">
                Upload document
              </h2>
              <button
                onClick={onClose}
                className="rounded-lg p-1 text-text-secondary hover:bg-bg-hover hover:text-text-primary"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                handleFiles(e.dataTransfer.files);
              }}
              onClick={() => inputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 text-center transition-colors ${
                dragging
                  ? "border-flow bg-flow/5"
                  : "border-border hover:border-flow/50"
              }`}
            >
              {mutation.isPending ? (
                <Loader2 className="h-7 w-7 animate-spin text-flow" />
              ) : (
                <UploadCloud className="h-7 w-7 text-text-secondary" />
              )}
              <div>
                <p className="text-sm font-medium text-text-primary">
                  {mutation.isPending
                    ? "Indexing document…"
                    : "Drag & drop a file, or click to browse"}
                </p>
                <p className="mt-1 text-xs text-text-muted">
                  PDF, DOCX, Markdown, or TXT
                </p>
              </div>
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPTED.join(",")}
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
            </div>

            {error && (
              <p className="mt-3 text-sm text-red-400">{error}</p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
