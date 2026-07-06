import Link from "next/link";
import { BookCover } from "@/app/components/ui/BookCover";
import { CONTINUE_READING } from "@/app/lib/data";

export function ContinueReading() {
  const { book, chapter, chapterTitle, progressPct, minutesLeft } = CONTINUE_READING;

  return (
    <div className="bg-surface border-b border-border">
      <div className="max-w-screen-xl mx-auto px-4 md:px-6 lg:px-8 py-3">
        <div className="flex items-center gap-4">
          <BookCover book={book} size="xs" showBadge={false} />

          <div className="flex-1 min-w-0">
            <p className="text-2xs uppercase tracking-widest font-semibold text-gold mb-0.5">
              Continue reading
            </p>
            <p className="font-serif text-sm font-bold text-ink leading-tight truncate">
              {book.title}
            </p>
            <p className="text-2xs text-ink-muted truncate">
              Ch. {chapter} — {chapterTitle}
            </p>
            {/* Progress bar */}
            <div className="mt-1.5 h-0.5 bg-border-soft w-48 max-w-full">
              <div
                className="h-full bg-crimson"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="text-2xs text-ink-faint mt-0.5">
              {progressPct}% · ~{minutesLeft} min left
            </p>
          </div>

          <Link
            href={`/book/${book.slug}/chapter/${chapter}`}
            className="flex-shrink-0 bg-ink text-page text-2xs font-bold uppercase tracking-wider px-4 py-2 hover:bg-ink-mid transition-colors whitespace-nowrap"
          >
            Continue →
          </Link>
        </div>
      </div>
    </div>
  );
}