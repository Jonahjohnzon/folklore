import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import type { HistoryEntryDTO } from "@/app/services/LibraryService";
import { ProgressBar } from "@/components/progress-bar";
import { formatRelativeDate } from "@/lib/format";

export function HistoryListItem({ entry }: { entry: HistoryEntryDTO }) {
  return (
    <Link
      href={`/book/${entry.book.slug}/chapter/${entry.chapterId}`}
      className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition hover:bg-surface"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={entry.book.coverUrl ?? "/placeholder-cover.png"}
        alt={entry.book.title}
        className="h-16 w-11 shrink-0 rounded object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate font-sans text-sm font-semibold text-ink">{entry.book.title}</p>
        <p className="truncate font-sans text-xs text-ink-muted">
          Chapter {entry.chapterOrderIndex} · {entry.chapterTitle}
        </p>
        <div className="mt-1.5 flex items-center gap-2">
          {entry.completed ? (
            <span className="flex items-center gap-1 font-sans text-[11px] font-medium text-emerald-700">
              <CheckCircle2 size={11} /> Finished
            </span>
          ) : (
            <>
              <ProgressBar value={entry.bookProgressPct} className="w-20" />
              <span className="font-sans text-[11px] text-ink-muted">{entry.bookProgressPct}%</span>
            </>
          )}
        </div>
      </div>
      <span className="shrink-0 font-sans text-xs text-ink-muted">{formatRelativeDate(entry.lastReadAt)}</span>
    </Link>
  );
}