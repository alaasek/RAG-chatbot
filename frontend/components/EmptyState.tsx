import { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
      <Icon className="h-8 w-8 text-text-muted" strokeWidth={1.5} />
      <div>
        <p className="font-display text-base font-medium text-text-primary">
          {title}
        </p>
        <p className="mt-1 max-w-sm text-sm text-text-secondary">
          {description}
        </p>
      </div>
      {action}
    </div>
  );
}
