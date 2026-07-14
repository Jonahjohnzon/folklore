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
      <div className="overflow-x-auto">
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

      {totalPages > 1 && (
        <div className="mt-3 flex items-center justify-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            aria-label="Previous page"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-hairline text-ink-muted transition hover:border-accent hover:text-accent disabled:opacity-40"
          >
            <ChevronLeft size={14} />
          </button>

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

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            aria-label="Next page"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-hairline text-ink-muted transition hover:border-accent hover:text-accent disabled:opacity-40"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}