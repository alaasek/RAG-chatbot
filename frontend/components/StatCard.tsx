import { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = false,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-bg-surface p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-secondary">{label}</p>
        <Icon
          className={`h-4 w-4 ${accent ? "text-flow" : "text-text-muted"}`}
          strokeWidth={2}
        />
      </div>
      <p className="mt-3 font-display text-2xl font-semibold tracking-tight">
        {value}
      </p>
    </div>
  );
}
