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
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <Link href="/" replace className="mb-4 inline-flex items-center gap-1.5 font-sans text-sm text-ink-muted hover:text-ink">
        <ArrowLeft size={15} /> Home
      </Link>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">My Library</h1>
        <Link
          href="/history"
          replace
          className="flex items-center gap-1.5 rounded-full border border-hairline px-3.5 py-2 font-sans text-sm font-medium text-ink-muted hover:border-accent hover:text-accent"
        >
          <History size={14} /> Reading history
        </Link>
      </div>

      <StatusTabs active={status} counts={counts} onChange={setStatus} />

      {loading ? (
        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-2/3 animate-pulse rounded-lg bg-hairline" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-2 py-16 text-center">
          <p className="font-sans text-sm text-ink-muted">Nothing here yet.</p>
          <Link href="/" className="font-sans text-sm font-medium text-accent hover:underline">
            Browse books to add some
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {entries.map((entry) => (
            <BookGridCard key={entry.bookId} entry={entry} />
          ))}
        </div>
      )}
    </main>
  );
}