// components/book-summary-card.tsx
import Link from "next/link";
import type { CreatorBookDTO, BookManageDTO } from "@/app/services/DashboardService";
import { StatusBadge } from "./status-badge";
import { formatCompactNumber } from "@/lib/format";

export function BookSummaryCard({ book }: { book: CreatorBookDTO }) {
  return (
    <div className="flex items-center gap-4 px-5 py-4 transition hover:bg-bg">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={book.coverUrl ?? "/placeholder-cover.png"}
        alt={book.title}
        className="h-16 w-11 shrink-0 rounded-md object-cover shadow-sm"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-sans text-sm font-semibold text-ink">{book.title}</p>
          <StatusBadge status={book.status} />
        </div>
        <p className="mt-0.5 font-sans text-xs text-ink-muted">
          {book.totalChapters} chapters
          {book.reviewCount > 0 && (
            <> · {book.averageRating.toFixed(1)}★ ({book.reviewCount})</>
          )}
        </p>
      </div>
      <div className="hidden text-right sm:block">
        <p className="font-display text-sm font-bold text-ink">{formatCompactNumber(book.totalReads)}</p>
        <p className="font-sans text-[11px] text-ink-muted">reads</p>
      </div>
      <Link
        href={`/write/${book._id}`}
        className="shrink-0 rounded-full border border-hairline px-3 py-1.5 font-sans text-xs font-medium text-ink transition hover:border-accent hover:text-accent"
      >
        Manage
      </Link>
    </div>
  );
}

export function BookManageHeader({ book }: { book: BookManageDTO }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-hairline bg-surface p-5 shadow-sm sm:flex-row sm:items-start">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={book.coverUrl ?? "/placeholder-cover.png"}
        alt={book.title}
        className="h-44 w-32 shrink-0 self-center rounded-lg object-cover shadow-sm sm:self-start"
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={book.status} />
          {book.matureContent && (
            <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-1 font-sans text-xs font-medium text-red-700">
              18+
            </span>
          )}
        </div>
        <h1 className="mt-2 font-display text-2xl font-bold text-ink">{book.title}</h1>
        {book.description && (
          <p className="mt-1.5 font-sans text-sm leading-relaxed text-ink-muted">{book.description}</p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 font-sans text-sm text-ink-muted">
          {book.reviewCount > 0 && (
            <span className="flex items-center gap-1">
              <span className="text-gold">★</span> {book.averageRating.toFixed(1)} ({book.reviewCount})
            </span>
          )}
          <span>{formatCompactNumber(book.totalReads)} reads</span>
          <span>{book.totalChapters} chapters</span>
          <span className="uppercase">{book.language}</span>
        </div>
      </div>
    </div>
  );
}