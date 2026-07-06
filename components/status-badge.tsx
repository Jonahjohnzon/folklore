import type { BookStatus } from "@/lib/mockdata";

const CONFIG: Record<BookStatus, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-hairline/40 text-ink-muted" },
  ongoing: { label: "Ongoing", className: "bg-emerald-100 text-emerald-700" },
  completed: { label: "Completed", className: "bg-accent/10 text-accent" },
  hiatus: { label: "On hiatus", className: "bg-amber-100 text-amber-700" },
  removed: { label: "Removed", className: "bg-red-100 text-red-700" },
};

export function StatusBadge({ status }: { status: BookStatus }) {
  const cfg = CONFIG[status];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 font-sans text-xs font-medium ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}