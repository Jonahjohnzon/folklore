// components/chapter-performance-table.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Lock, Sparkles, Pencil, ChevronLeft, ChevronRight } from "lucide-react";
import type { ChapterPerformanceDTO } from "@/app/services/DashboardService";
import { formatRelativeDate } from "@/lib/format";

const CHAPTERS_PER_PAGE = 10;

export function ChapterPerformanceTable({
  bookId,
  chapters,
}: {
  bookId: string;
  chapters: ChapterPerformanceDTO[];
}) {
  const [page, setPage] = useState(1);

  if (chapters.length === 0) {
    return <p className="py-8 text-center font-sans text-sm text-ink-muted">No chapters yet.</p>;
  }

  const totalPages = Math.max(1, Math.ceil(chapters.length / CHAPTERS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const pagedChapters = chapters.slice(
    (currentPage - 1) * CHAPTERS_PER_PAGE,
    currentPage * CHAPTERS_PER_PAGE
  );

  return (
    <div>
      {/* Table — sm and up. A horizontally-scrolling table is a poor mobile
          experience (tiny sideways-scrubbing text), so it's swapped for cards below `sm`. */}
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full border-collapse font-sans text-sm">
          <thead>
            <tr className="border-b border-hairline text-left text-xs uppercase tracking-wide text-ink-muted">
              <th className="py-2 pr-3 font-medium">Chapter</th>
              <th className="py-2 pr-3 font-medium">Words</th>
              <th className="py-2 pr-3 font-medium">Access</th>
              <th className="py-2 pr-3 font-medium">Published</th>
              <th className="py-2 pr-3 font-medium">
                <span className="inline-flex items-center gap-1">
                  Finish rate <Sparkles size={11} className="text-accent" />
                </span>
              </th>
              <th className="py-2 pl-3 text-right font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {pagedChapters.map((c) => (
              <tr key={c._id} className="transition hover:bg-bg">
                <td className="py-2.5 pr-3">
                  <span className="font-medium text-ink">
                    {c.orderIndex}. {c.title}
                  </span>
                </td>
                <td className="py-2.5 pr-3 text-ink-muted">{c.wordCount.toLocaleString()}</td>
                <td className="py-2.5 pr-3 text-ink-muted">
                  {c.accessType === "free" ? (
                    "Free"
                  ) : (
                    <span className="inline-flex items-center gap-1">
                      <Lock size={11} /> {c.coinsRequired} coins
                    </span>
                  )}
                </td>
                <td className="py-2.5 pr-3 text-ink-muted">
                  {c.publishedAt ? formatRelativeDate(c.publishedAt) : "Draft"}
                </td>
                <td className="py-2.5 pr-3 text-ink-muted/50">— soon</td>
                <td className="py-2.5 pl-3 text-right">
                  <Link
                    href={`/write/${bookId}/editor?chapterId=${c._id}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-hairline px-3 py-1.5 font-sans text-xs font-medium text-ink transition hover:border-accent hover:text-accent"
                  >
                    <Pencil size={12} /> Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards — below `sm`. Same data, stacked so nothing gets clipped or
          needs sideways scrolling on a phone. */}
      <div className="divide-y divide-hairline sm:hidden">
        {pagedChapters.map((c) => (
          <div key={c._id} className="flex items-start justify-between gap-3 py-3">
            <div className="min-w-0 flex-1">
              <p className="truncate font-sans text-sm font-medium text-ink">
                {c.orderIndex}. {c.title}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-sans text-xs text-ink-muted">
                <span>{c.wordCount.toLocaleString()} words</span>
                <span>
                  {c.accessType === "free" ? (
                    "Free"
                  ) : (
                    <span className="inline-flex items-center gap-1">
                      <Lock size={11} /> {c.coinsRequired} coins
                    </span>
                  )}
                </span>
                <span>{c.publishedAt ? formatRelativeDate(c.publishedAt) : "Draft"}</span>
              </div>
            </div>
            <Link
              href={`/write/${bookId}/editor?chapterId=${c._id}`}
              aria-label={`Edit ${c.title}`}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-hairline px-3 py-1.5 font-sans text-xs font-medium text-ink transition hover:border-accent hover:text-accent"
            >
              <Pencil size={12} /> Edit
            </Link>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-3 flex items-center justify-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            aria-label="Previous page"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-hairline text-ink-muted transition hover:border-accent hover:text-accent disabled:opacity-40"
          >
            <ChevronLeft size={14} />
          </button>

          {/* Numbered pages — sm and up. On mobile a long run of page buttons
              (e.g. 8+ chapters worth of pages) would overflow, so it collapses
              to a simple "Page X of Y" label instead. */}
          <div className="hidden items-center gap-1 sm:flex">
            {Array.from({ length: totalPages }).map((_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`h-8 w-8 rounded-full font-sans text-xs font-medium transition ${
                    pageNum === currentPage
                      ? "bg-accent text-accent-ink"
                      : "border border-hairline text-ink-muted hover:border-accent hover:text-accent"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          <span className="px-2 font-sans text-xs font-medium text-ink-muted sm:hidden">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            aria-label="Next page"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-hairline text-ink-muted transition hover:border-accent hover:text-accent disabled:opacity-40"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}