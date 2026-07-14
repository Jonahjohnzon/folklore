"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";
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
    <main className="mx-auto max-w-3xl px-4 pb-10 pt-4 sm:px-6 sm:py-6">
      <Link
        href="/"
        replace
        className="-ml-2 mb-4 inline-flex items-center gap-1.5 rounded-full px-2 py-1.5 font-sans text-sm text-ink-muted transition hover:text-ink active:scale-95"
      >
        <ArrowLeft size={16} strokeWidth={2.25} />
        Home
      </Link>

      <h1 className="mb-1 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
        Reading history
      </h1>
      <p className="mb-6 font-sans text-sm text-ink-muted">
        Every chapter you&apos;ve opened, regardless of what shelf the book is on.
      </p>

      {loading ? (
        <div className="flex flex-col gap-6">
          {Array.from({ length: 2 }).map((_, g) => (
            <div key={g} className="flex flex-col gap-2">
              <div className="h-3 w-24 animate-pulse rounded-full bg-hairline" />
              <div className="overflow-hidden rounded-xl border border-hairline">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-16 animate-pulse border-b border-hairline bg-hairline/60 last:border-b-0"
                    style={{ animationDelay: `${i * 80}ms` }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div className="mt-4 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-hairline px-6 py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-hairline/60">
            <Clock size={20} strokeWidth={1.75} className="text-ink-muted" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="font-sans text-sm font-medium text-ink">No reading activity yet</p>
            <p className="font-sans text-sm text-ink-muted">Open a chapter and it&apos;ll show up here.</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map((group) => (
            <div key={group.label}>
              <h2 className="mb-2 font-sans text-xs font-semibold uppercase tracking-wide text-ink-muted">
                {group.label}
              </h2>
              <div className="divide-y divide-hairline overflow-hidden rounded-xl border border-hairline bg-surface">
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