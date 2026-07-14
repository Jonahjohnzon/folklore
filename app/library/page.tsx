"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { History, ArrowLeft } from "lucide-react";
import { StatusTabs } from "@/components/library/status-tabs";
import { BookGridCard } from "@/components/library/book-grid-card";
import {
  LibraryService,
  type LibraryEntryDTO,
  type LibraryCounts,
  type LibraryStatus,
} from "@/app/services/LibraryService";

const EMPTY_COUNTS: LibraryCounts = { reading: 0, want_to_read: 0, completed: 0, dropped: 0, all: 0 };

export default function LibraryPage() {
  const [status, setStatus] = useState<LibraryStatus | "all">("all");
  const [entries, setEntries] = useState<LibraryEntryDTO[]>([]);
  const [counts, setCounts] = useState<LibraryCounts>(EMPTY_COUNTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    LibraryService.getCounts()
      .then(({ data }) => !cancelled && setCounts(data.counts))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    LibraryService.getEntries(status === "all" ? undefined : status)
      .then(({ data }) => !cancelled && setEntries(data.entries))
      .catch(() => !cancelled && setEntries([]))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [status]);

  return (
    <main className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6">
      <Link href="/" replace className="mb-4 inline-flex items-center gap-1.5 font-sans text-sm text-ink-muted hover:text-ink">
        <ArrowLeft size={15} /> Home
      </Link>

      {/* Title and history link stack on very narrow screens, sit side by side from `sm` up */}
      <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-xl font-bold text-ink sm:text-2xl md:text-3xl">My Library</h1>
        <Link
          href="/history"
          replace
          className="inline-flex w-fit items-center gap-1.5 rounded-full border border-hairline px-3.5 py-2 font-sans text-sm font-medium text-ink-muted hover:border-accent hover:text-accent"
        >
          <History size={14} /> Reading history
        </Link>
      </div>

      {/* StatusTabs isn't shown here, but if it renders several tabs in a row it likely
          needs the same `overflow-x-auto` treatment on narrow screens so labels don't clip. */}
      <div className="-mx-3 overflow-x-auto scrollbar-none px-3 sm:mx-0  sm:px-0">
        <StatusTabs active={status} counts={counts} onChange={setStatus} />
      </div>

      {loading ? (
        <div className="mt-5 grid grid-cols-2 gap-x-3 gap-y-5 sm:mt-6 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-6 md:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-2/3 animate-pulse rounded-lg bg-hairline" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-2 px-4 py-16 text-center sm:mt-10">
          <p className="font-sans text-sm text-ink-muted">Nothing here yet.</p>
          <Link href="/" className="font-sans text-sm font-medium text-accent hover:underline">
            Browse books to add some
          </Link>
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-x-3 gap-y-5 sm:mt-6 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-6 md:grid-cols-4 lg:grid-cols-6">
          {entries.map((entry) => (
            <BookGridCard key={entry.bookId} entry={entry} />
          ))}
        </div>
      )}
    </main>
  );
}