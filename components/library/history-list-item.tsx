import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import type { HistoryEntryDTO } from "@/app/services/LibraryService";
import { ProgressBar } from "@/components/progress-bar";
import { formatRelativeDate } from "@/lib/format";

export function HistoryListItem({ entry }: { entry: HistoryEntryDTO }) {
  const isBookComplete = entry.completed && entry.bookProgressPct >= 100;

  return (
    <Link
      href={`/book/${entry.book.slug}/chapter/${entry.chapterId}`}
      className="flex items-center gap-3 rounded-xl px-2 py-3 transition active:scale-[0.98] active:bg-surface sm:hover:bg-surface"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={entry.book.coverUrl ?? "/placeholder-cover.png"}
        alt={entry.book.title}
        className="h-16 w-11 shrink-0 rounded-md object-cover shadow-sm sm:h-16 sm:w-11"
      />

      <div className="min-w-0 flex-1">
        <p className="truncate font-sans text-sm font-semibold leading-tight text-ink">
          {entry.book.title}
        </p>
        <p className="mt-0.5 truncate font-sans text-xs text-ink-muted">
          Ch. {entry.chapterOrderIndex} · {entry.chapterTitle}
        </p>

        <div className="mt-2 flex items-center gap-2">
          {isBookComplete ? (
            <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 font-sans text-[11px] font-medium text-emerald-700">
              <CheckCircle2 size={11} />
              Finished
            </span>
          ) : (
            <>
              <ProgressBar value={entry.bookProgressPct} className="w-16 sm:w-20" />
              <span className="shrink-0 font-sans text-[11px] tabular-nums text-ink-muted">
                {entry.bookProgressPct}%
              </span>
            </>
          )}
        </div>
      </div>

      <span className="shrink-0 self-start font-sans text-[11px] text-ink-muted sm:self-center sm:text-xs">
        {formatRelativeDate(entry.lastReadAt)}
      </span>
    </Link>
  );
}