"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Loader2, BookX, SlidersHorizontal, Check } from "lucide-react";
import { BookCard } from "@/components/book-card";
import {
  BrowseService,
  type Pagination,
  type BrowseSort,
  type BrowseStatus,
  type BrowseMature,
} from "@/app/services/BrowseService";
import type { Book } from "@/lib/types";

const SORT_OPTIONS: { value: BrowseSort; label: string }[] = [
  { value: "popular", label: "Most read" },
  { value: "newest", label: "Newest" },
  { value: "rating", label: "Top rated" },
  { value: "updated", label: "Recently updated" },
];

const STATUS_OPTIONS: { value: BrowseStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "ongoing", label: "Ongoing" },
  { value: "completed", label: "Completed" },
  { value: "hiatus", label: "On hiatus" },
];

export default function BrowseByTagPage() {
  const params = useParams<{ tag: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Math.max(1, Number(searchParams.get("page") ?? 1) || 1);
  const sort = (searchParams.get("sort") as BrowseSort) || "popular";
  const status = (searchParams.get("status") as BrowseStatus) || "all";
  const mature = (searchParams.get("mature") as BrowseMature) || "include";

  const [tagName, setTagName] = useState<string | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    BrowseService.byTag(params.tag, { page, sort, status, mature })
      .then(({ data }) => {
        if (cancelled) return;
        setTagName(data.tag.name);
        setBooks(data.books);
        setPagination(data.pagination);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Couldn't load this genre.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [params.tag, page, sort, status, mature]);

  function updateQuery(next: Partial<{ page: number; sort: BrowseSort; status: BrowseStatus; mature: BrowseMature }>) {
    const q = new URLSearchParams(searchParams.toString());
    const merged = { page, sort, status, mature, ...next };
    // Any filter change (not a page change) resets to page 1.
    if (next.sort !== undefined || next.status !== undefined || next.mature !== undefined) {
      merged.page = 1;
    }
    q.set("page", String(merged.page));
    q.set("sort", merged.sort);
    q.set("status", merged.status);
    q.set("mature", merged.mature);
    router.push(`/browse/${params.tag}?${q.toString()}`);
  }

  const activeFilterCount = (status !== "all" ? 1 : 0) + (mature === "exclude" ? 1 : 0);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="border-b border-hairline pb-6">
        <p className="font-sans text-xs font-semibold uppercase tracking-wide text-accent">Browse</p>
        <h1 className="mt-1 font-display text-4xl font-bold capitalize text-ink">
          {tagName ?? params.tag.replace(/-/g, " ")}
        </h1>
        {pagination && (
          <p className="mt-1.5 font-sans text-sm text-ink-muted">
            {pagination.total.toLocaleString()} {pagination.total === 1 ? "book" : "books"}
          </p>
        )}
      </div>

      {/* Filter bar */}
      <div className="sticky top-0 z-10 -mx-4 mt-5 flex flex-wrap items-center gap-2 border-b border-hairline bg-bg/90 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-xl sm:border sm:px-3 sm:shadow-sm">
        <div className="flex items-center gap-1.5 pr-1">
          <SlidersHorizontal size={14} className="text-ink-muted" />
          <span className="font-sans text-xs font-semibold text-ink-muted">Sort</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateQuery({ sort: opt.value })}
              className={`rounded-full border px-3 py-1.5 font-sans text-xs font-medium transition ${
                sort === opt.value
                  ? "border-accent bg-accent text-accent-ink shadow-sm"
                  : "border-hairline bg-bg text-ink hover:border-accent"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="ml-auto">
          <button
            onClick={() => setFiltersOpen((v) => !v)}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-sans text-xs font-medium transition ${
              activeFilterCount > 0
                ? "border-accent bg-accent/10 text-accent"
                : "border-hairline bg-bg text-ink hover:border-accent"
            }`}
          >
            Filters
            {activeFilterCount > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent font-mono text-[10px] text-accent-ink">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {filtersOpen && (
        <div className="mt-2 grid gap-4 rounded-xl border border-hairline bg-surface p-4 shadow-sm sm:grid-cols-2">
          <div>
            <h3 className="font-sans text-xs font-semibold uppercase tracking-wide text-ink-muted">Status</h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => updateQuery({ status: opt.value })}
                  className={`flex items-center gap-1 rounded-full border px-3 py-1.5 font-sans text-xs font-medium transition ${
                    status === opt.value
                      ? "border-accent bg-accent/10 text-ink"
                      : "border-hairline bg-bg text-ink hover:border-accent"
                  }`}
                >
                  {status === opt.value && <Check size={12} className="text-accent" />}
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-sans text-xs font-semibold uppercase tracking-wide text-ink-muted">Content</h3>
            <label className="mt-2 flex w-fit cursor-pointer items-center gap-2 rounded-full border border-hairline bg-bg px-3 py-1.5 transition hover:border-accent">
              <input
                type="checkbox"
                checked={mature === "exclude"}
                onChange={(e) => updateQuery({ mature: e.target.checked ? "exclude" : "include" })}
                className="h-3.5 w-3.5 accent-accent"
              />
              <span className="font-sans text-xs text-ink">Hide mature content</span>
            </label>
          </div>
        </div>
      )}

      {/* Results */}
      {error && (
        <div className="mt-6 rounded-lg border border-red-300 bg-red-50 px-3.5 py-2 font-sans text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="mt-20 flex flex-col items-center gap-2 text-ink-muted">
          <Loader2 size={20} className="animate-spin" />
          <span className="font-sans text-sm">Loading books…</span>
        </div>
      ) : books.length === 0 ? (
        <div className="mt-20 flex flex-col items-center gap-2 text-ink-muted">
          <BookX size={24} />
          <span className="font-sans text-sm">No books match these filters.</span>
          {activeFilterCount > 0 && (
            <button
              onClick={() => updateQuery({ status: "all", mature: "include" })}
              className="mt-1 font-sans text-xs font-medium text-accent hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {books.map((book) => (
            <BookCard key={book._id} book={book} />
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          <button
            onClick={() => updateQuery({ page: page - 1 })}
            disabled={page <= 1}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-hairline bg-bg text-ink transition hover:border-accent disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Previous page"
          >
            <ChevronLeft size={16} />
          </button>

          <PageNumbers current={page} total={pagination.totalPages} onSelect={(p) => updateQuery({ page: p })} />

          <button
            onClick={() => updateQuery({ page: page + 1 })}
            disabled={page >= pagination.totalPages}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-hairline bg-bg text-ink transition hover:border-accent disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Next page"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </main>
  );
}

function PageNumbers({
  current, total, onSelect,
}: {
  current: number;
  total: number;
  onSelect: (p: number) => void;
}) {
  const pages = getPageWindow(current, total);
  return (
    <div className="flex items-center gap-1">
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`ellipsis-${i}`} className="px-1.5 font-sans text-sm text-ink-muted">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onSelect(p)}
            className={`flex h-9 min-w-9 items-center justify-center rounded-full px-2 font-sans text-sm font-medium transition ${
              p === current
                ? "bg-accent text-accent-ink shadow-sm"
                : "border border-hairline bg-bg text-ink hover:border-accent"
            }`}
          >
            {p}
          </button>
        )
      )}
    </div>
  );
}

// Builds something like [1, "…", 4, 5, 6, "…", 12] centered on `current`.
function getPageWindow(current: number, total: number): (number | "…")[] {
  const spread = 1;
  const pages: (number | "…")[] = [1];
  if (current - spread > 2) pages.push("…");
  for (let p = Math.max(2, current - spread); p <= Math.min(total - 1, current + spread); p++) {
    pages.push(p);
  }
  if (current + spread < total - 1) pages.push("…");
  if (total > 1) pages.push(total);
  return pages;
}