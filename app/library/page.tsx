"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { History, ArrowLeft, LibraryBig } from "lucide-react";
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
  const [scrolled, setScrolled] = useState(false);

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

  // Give the sticky filter bar a hairline + shadow once content scrolls under it,
  // so it reads as "sticky" instead of just floating on the same flat background.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <main className="mx-auto max-w-7xl px-4 pb-10 pt-4 sm:px-6 sm:py-6">
      <div className="mb-4 flex items-center justify-between sm:mb-6">
        <Link
          href="/"
          replace
          className="-ml-2 inline-flex items-center gap-1.5 rounded-full px-2 py-1.5 font-sans text-sm text-ink-muted transition hover:text-ink active:scale-95"
        >
          <ArrowLeft size={16} strokeWidth={2.25} />
          Home
        </Link>

        <Link
          href="/history"
          replace
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-hairline px-4 font-sans text-sm font-medium text-ink-muted transition active:scale-95 sm:hover:border-accent sm:hover:text-accent"
        >
          <History size={14} strokeWidth={2.25} />
          History
        </Link>
      </div>

      <h1 className="mb-4 font-display text-2xl font-bold tracking-tight text-ink sm:mb-5 sm:text-3xl">
        My Library
      </h1>

      <div
        className={[
          "sticky top-0 z-10 -mx-4 bg-page/95 px-4 pb-3 pt-2 backdrop-blur transition-shadow duration-200 supports-backdrop-blur:bg-page/80 sm:-mx-6 sm:px-6",
          scrolled ? "border-b border-hairline shadow-sm" : "",
        ].join(" ")}
      >
        <StatusTabs active={status} counts={counts} onChange={setStatus} />
      </div>

      {loading ? (
        <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-x-4 md:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div
                className="aspect-2/3 animate-pulse rounded-lg bg-hairline"
                style={{ animationDelay: `${(i % 6) * 60}ms` }}
              />
              <div
                className="h-3 w-4/5 animate-pulse rounded-full bg-hairline"
                style={{ animationDelay: `${(i % 6) * 60}ms` }}
              />
            </div>
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-hairline px-6 py-16 text-center sm:mt-8">
          <div className="flex size-12 items-center justify-center rounded-full bg-hairline/60">
            <LibraryBig size={20} strokeWidth={1.75} className="text-ink-muted" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="font-sans text-sm font-medium text-ink">
              {status === "all" ? "Your library is empty" : "Nothing on this shelf yet"}
            </p>
            <p className="font-sans text-sm text-ink-muted">Add a book to get started.</p>
          </div>
          <Link
            href="/"
            className="mt-1 inline-flex h-9 items-center rounded-full bg-accent px-4 font-sans text-sm font-medium text-white transition active:scale-95 sm:hover:opacity-90"
          >
            Browse books
          </Link>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-x-4 md:grid-cols-4 lg:grid-cols-6">
          {entries.map((entry) => (
            <BookGridCard key={entry.bookId} entry={entry} />
          ))}
        </div>
      )}
    </main>
  );
}