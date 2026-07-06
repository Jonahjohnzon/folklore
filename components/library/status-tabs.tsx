"use client";

// components/library/status-tabs.tsx
import type { LibraryStatus, LibraryCounts } from "@/app/services/LibraryService";

const TABS: { id: LibraryStatus | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "reading", label: "Reading" },
  { id: "want_to_read", label: "Want to read" },
  { id: "completed", label: "Completed" },
  { id: "dropped", label: "Dropped" },
];

export function StatusTabs({
  active,
  counts,
  onChange,
}: {
  active: LibraryStatus | "all";
  counts: LibraryCounts;
  onChange: (status: LibraryStatus | "all") => void;
}) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 font-sans text-sm font-medium transition ${
            active === tab.id
              ? "border-accent bg-accent/10 text-accent"
              : "border-hairline text-ink-muted hover:border-accent/60 hover:text-ink"
          }`}
        >
          {tab.label}
          <span className="font-mono text-xs opacity-70">{counts[tab.id] ?? 0}</span>
        </button>
      ))}
    </div>
  );
}