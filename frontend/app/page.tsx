"use client";

import { useQuery } from "@tanstack/react-query";
import { FileStack, MessagesSquare, HardDrive, Timer, LayoutGrid } from "lucide-react";
import { fetchDashboard } from "@/lib/api";
import { StatCard } from "@/components/StatCard";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard,
    refetchInterval: 10_000,
  });

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <div className="mb-8 flex items-center gap-2">
        <LayoutGrid className="h-5 w-5 text-flow" />
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Dashboard
        </h1>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-xl border border-border bg-bg-surface"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <StatCard
            label="Documents indexed"
            value={data?.total_documents ?? 0}
            icon={FileStack}
            accent
          />
          <StatCard
            label="Chunks in vector store"
            value={data?.total_chunks ?? 0}
            icon={LayoutGrid}
          />
          <StatCard
            label="Conversations"
            value={data?.total_conversations ?? 0}
            icon={MessagesSquare}
          />
          <StatCard
            label="Questions asked"
            value={data?.total_questions ?? 0}
            icon={MessagesSquare}
          />
          <StatCard
            label="Storage used"
            value={formatBytes(data?.storage_bytes ?? 0)}
            icon={HardDrive}
          />
          <StatCard
            label="Avg. response time"
            value={`${Math.round(data?.avg_response_time_ms ?? 0)} ms`}
            icon={Timer}
            accent
          />
        </div>
      )}

      <div className="mt-10 rounded-xl border border-border bg-bg-surface p-6">
        <p className="font-display text-sm font-medium text-text-primary">
          Getting started
        </p>
        <p className="mt-1 text-sm text-text-secondary">
          Upload a document from the Documents tab, then head to Chat and ask
          a question. Every answer is grounded in your uploaded content and
          shows exactly which document and page it came from.
        </p>
      </div>
    </div>
  );
}
