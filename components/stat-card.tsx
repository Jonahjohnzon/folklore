import type { LucideIcon } from "lucide-react";

export function StatCard({
  icon: Icon,
  label,
  value,
  delta,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  delta?: string;
}) {
  return (
    <div className="rounded-xl border border-hairline bg-surface p-4">
      <div className="flex items-center gap-2 font-sans text-xs font-medium text-ink-muted">
        <Icon size={14} /> {label}
      </div>
      <p className="mt-2 font-display text-2xl font-bold text-ink">{value}</p>
      {delta && <p className="mt-0.5 font-sans text-xs font-medium text-accent">{delta}</p>}
    </div>
  );
}
