"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { LayoutDashboard, MessageSquare, FileStack, Waves } from "lucide-react";
import clsx from "clsx";
import { fetchHistory } from "@/lib/api";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/documents", label: "Documents", icon: FileStack },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: history } = useQuery({
    queryKey: ["history"],
    queryFn: fetchHistory,
    staleTime: 15_000,
  });

  return (
    <aside className="relative flex h-full w-64 shrink-0 flex-col border-r border-border bg-bg-surface">
      {/* signature flow line */}
      <div className="absolute right-0 top-0 h-full w-px bg-gradient-to-b from-flow/60 via-flow/10 to-transparent" />

      <div className="flex items-center gap-2 px-5 py-6">
        <Waves className="h-5 w-5 text-flow" strokeWidth={2.5} />
        <span className="font-display text-lg font-semibold tracking-tight">
          KnowFlow <span className="text-flow">AI</span>
        </span>
      </div>

      <nav className="flex flex-col gap-1 px-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-bg-hover text-text-primary"
                  : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
              )}
            >
              <Icon className="h-4 w-4" strokeWidth={2} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 flex-1 overflow-y-auto px-3 scrollbar-thin">
        <p className="px-3 pb-2 font-mono text-[11px] uppercase tracking-wider text-text-muted">
          Recent conversations
        </p>
        <div className="flex flex-col gap-0.5">
          {history?.length ? (
            history.map((c) => (
              <Link
                key={c.id}
                href={`/chat?c=${c.id}`}
                className="truncate rounded-lg px-3 py-2 text-sm text-text-secondary hover:bg-bg-hover hover:text-text-primary"
              >
                {c.title || "Untitled conversation"}
              </Link>
            ))
          ) : (
            <p className="px-3 py-2 text-sm text-text-muted">
              No conversations yet
            </p>
          )}
        </div>
      </div>

      <div className="border-t border-border px-4 py-4">
        <p className="font-mono text-[11px] text-text-muted">
          v0.1.0 — skeleton build
        </p>
      </div>
    </aside>
  );
}
