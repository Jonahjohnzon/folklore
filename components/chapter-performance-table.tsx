// components/chapter-performance-table.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Lock,
  Sparkles,
  Pencil,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Trash2,
  Loader2,
} from "lucide-react";
import type { ChapterPerformanceDTO } from "@/app/services/DashboardService";
import { ChapterService } from "@/app/services/ChapterService";
import { formatRelativeDate } from "@/lib/format";

const CHAPTERS_PER_PAGE = 10;

export function ChapterPerformanceTable({
  bookId,
  chapters,
  onChaptersChange,
  onTotalChaptersChange,
}: {
  bookId: string;
  chapters: ChapterPerformanceDTO[];
  onChaptersChange: (chapters: ChapterPerformanceDTO[]) => void;
  onTotalChaptersChange?: (total: number) => void;
}) {
  const [page, setPage] = useState(1);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const sorted = [...chapters].sort((a, b) => a.orderIndex - b.orderIndex);

  if (sorted.length === 0) {
    return <p className="py-8 text-center font-sans text-sm text-ink-muted">No chapters yet.</p>;
  }

  const totalPages = Math.max(1, Math.ceil(sorted.length / CHAPTERS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const pagedChapters = sorted.slice(
    (currentPage - 1) * CHAPTERS_PER_PAGE,
    currentPage * CHAPTERS_PER_PAGE
  );

  async function handleMove(chapterId: string, direction: "up" | "down") {
    if (pendingId) return;
    setPendingId(chapterId);
    try {
      const { data } = await ChapterService.move(chapterId, direction);
      if (data.moved && data.swapped) {
        const next = sorted.map((c) => {
          const match = data.swapped!.find((s) => s.id === c._id);
          return match ? { ...c, orderIndex: match.orderIndex } : c;
        });
        onChaptersChange(next);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPendingId(null);
    }
  }

  async function handleDelete(chapterId: string) {
    if (pendingId) return;
    setPendingId(chapterId);
    try {
      const { data } = await ChapterService.delete(chapterId);
      const removedIndex = sorted.find((c) => c._id === chapterId)?.orderIndex ?? 0;
      const next = sorted
        .filter((c) => c._id !== chapterId)
        .map((c) => (c.orderIndex > removedIndex ? { ...c, orderIndex: c.orderIndex - 1 } : c));
      onChaptersChange(next);
      onTotalChaptersChange?.(data.totalChapters);
    } catch (err) {
      console.error(err);
    } finally {
      setPendingId(null);
      setConfirmId(null);
    }
  }

  const minIndex = sorted[0]?.orderIndex;
  const maxIndex = sorted[sorted.length - 1]?.orderIndex;

  const RowActions = ({ c }: { c: ChapterPerformanceDTO }) => {
    const isPending = pendingId === c._id;
    return (
      <div className="flex shrink-0 items-center gap-1">
        <button
          onClick={() => handleMove(c._id, "up")}
          disabled={c.orderIndex === minIndex || !!pendingId}
          aria-label={`Move ${c.title} up`}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-hairline text-ink-muted transition hover:border-accent hover:text-accent disabled:opacity-30"
        >
          <ChevronUp size={13} />
        </button>
        <button
          onClick={() => handleMove(c._id, "down")}
          disabled={c.orderIndex === maxIndex || !!pendingId}
          aria-label={`Move ${c.title} down`}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-hairline text-ink-muted transition hover:border-accent hover:text-accent disabled:opacity-30"
        >
          <ChevronDown size={13} />
        </button>
        <Link
          href={`/write/${bookId}/editor?chapterId=${c._id}`}
          className="flex items-center gap-1.5 rounded-full border border-hairline px-3 py-1.5 font-sans text-xs font-medium text-ink transition hover:border-accent hover:text-accent"
        >
          <Pencil size={12} /> Edit
        </Link>
        <button
          onClick={() => setConfirmId(c._id)}
          disabled={!!pendingId}
          aria-label={`Delete ${c.title}`}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-hairline text-ink-muted transition hover:border-red-400 hover:text-red-600 disabled:opacity-30"
        >
          {isPending ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
        </button>
      </div>
    );
  };

  return (
    <div>
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
                  <RowActions c={c} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-hairline sm:hidden">
        {pagedChapters.map((c) => (
          <div key={c._id} className="flex flex-col gap-2 py-3">
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
            <RowActions c={c} />
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

      {confirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-hairline bg-surface p-5">
            <h3 className="font-display text-base font-semibold text-ink">Delete this chapter?</h3>
            <p className="mt-2 font-sans text-sm text-ink-muted">
              This can&apos;t be undone. Later chapters will shift up to fill the gap.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setConfirmId(null)}
                className="rounded-full border border-hairline px-4 py-2 font-sans text-sm font-medium text-ink hover:border-accent hover:text-accent"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmId)}
                disabled={!!pendingId}
                className="flex items-center gap-1.5 rounded-full bg-red-600 px-4 py-2 font-sans text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
              >
                {pendingId ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}