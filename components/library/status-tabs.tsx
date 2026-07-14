"use client";

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
    <div className="flex snap-x snap-mandatory gap-1.5 overflow-x-auto scroll-px-3 pb-1">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex shrink-0 snap-start items-center gap-1.5 rounded-full border px-3.5 py-2 font-sans text-sm font-medium transition active:scale-[0.96] sm:py-1.5 sm:hover:border-accent/60 sm:hover:text-ink ${
            active === tab.id
              ? "border-accent bg-accent/10 text-accent"
              : "border-hairline text-ink-muted"
          }`}
        >
          {tab.label}
          <span
            className={`rounded-full px-1.5 py-px font-mono text-[11px] ${
              active === tab.id ? "bg-accent/15" : "bg-hairline/50"
            }`}
          >
            {counts[tab.id] ?? 0}
          </span>
        </button>
      ))}
    </div>
  );
}