"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { HistoryListItem } from "@/components/library/history-list-item";
import { LibraryService, type HistoryEntryDTO } from "@/app/services/LibraryService";
import { groupHistoryByDate } from "@/lib/history-grouping";

export default function ReadingHistoryPage() {
  const [entries, setEntries] = useState<HistoryEntryDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    LibraryService.getHistory()
      .then(({ data }) => !cancelled && setEntries(data.entries))
      .catch(() => !cancelled && setEntries([]))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const groups = groupHistoryByDate(entries);

  return (
    <main className="mx-auto max-w-3xl px-3 py-4 sm:px-6 sm:py-6">
      <Link href="/" replace className="mb-4 inline-flex items-center gap-1.5 font-sans text-sm text-ink-muted hover:text-ink">
        <ArrowLeft size={15} /> Home
      </Link>

      <h1 className="mb-1 font-display text-xl font-bold text-ink sm:text-2xl md:text-3xl">Reading history</h1>
      <p className="mb-5 font-sans text-sm text-ink-muted sm:mb-6">
        {"Every chapter you've opened, regardless of what shelf the book is on."}
      </p>

      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-hairline" />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-4 py-16 text-center">
          <p className="font-sans text-sm text-ink-muted">No reading activity yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-5 sm:gap-6">
          {groups.map((group) => (
            <div key={group.label}>
              <h2 className="mb-1.5 font-sans text-xs font-semibold uppercase tracking-wide text-ink-muted">
                {group.label}
              </h2>
              <div className="divide-y divide-hairline rounded-xl border border-hairline bg-surface px-1">
                {group.entries.map((entry) => (
                  <HistoryListItem key={entry.chapterId} entry={entry} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}