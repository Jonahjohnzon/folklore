import Link from "next/link";
import { Star, BookOpen } from "lucide-react";
import type { Book } from "@/lib/types";

function formatReads(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return `${n}`;
}

export function BookCard({
  book,
  size = "default",
}: {
  book: Book;
  size?: "default" | "compact" | "cover-only" | "cover-big" | "cover-stacked";
}) {
  if (size === "cover-big") {
    return (
      <Link href={`/book/${book.slug}`} className="group block h-full w-32 shrink-0 sm:w-40">
        <div className="relative h-full overflow-hidden rounded-md border border-hairline bg-surface shadow-sm transition group-hover:-translate-y-1 group-hover:shadow-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={book.coverUrl} alt={book.title} className="h-full w-full object-cover" loading="lazy" />
          {book.matureContent && (
            <span className="absolute left-1.5 top-1.5 rounded bg-black/70 px-1.5 py-0.5 font-sans text-[10px] font-semibold text-white">
              18+
            </span>
          )}
        </div>
      </Link>
    );
  }

if (size === "cover-stacked") {
  return (
    <Link href={`/book/${book.slug}`} className="group block w-16 min-h-0 flex-1 shrink-0 sm:w-20">
      <div className="relative h-full overflow-hidden rounded-md border border-hairline bg-surface shadow-sm transition group-hover:-translate-y-1 group-hover:shadow-lg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={book.coverUrl} alt={book.title} className="h-full w-full object-cover" loading="lazy" />
        {book.matureContent && (
          <span className="absolute left-1 top-1 rounded bg-black/70 px-1 py-0.5 font-sans text-[9px] font-semibold text-white">
            18+
          </span>
        )}
      </div>
    </Link>
  );
}

  if (size === "cover-only") {
    return (
      <Link href={`/book/${book.slug}`} className="group block w-32 shrink-0 sm:w-40">
        <div className="relative aspect-2/3 overflow-hidden rounded-md border border-hairline bg-surface shadow-sm transition group-hover:-translate-y-1 group-hover:shadow-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={book.coverUrl} alt={book.title} className="h-full w-full object-cover" loading="lazy" />
          {book.matureContent && (
            <span className="absolute left-1.5 top-1.5 rounded bg-black/70 px-1.5 py-0.5 font-sans text-[10px] font-semibold text-white">
              18+
            </span>
          )}
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/book/${book.slug}`}
      className={`group block shrink-0 ${size === "compact" ? "w-24 sm:w-28" : "w-28 sm:w-36"}`}
    >
      <div className="relative aspect-4/6 overflow-hidden rounded-lg border border-hairline bg-surface shadow-sm transition group-hover:-translate-y-1 group-hover:shadow-lg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={book.coverUrl}
          alt={book.title}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        {book.matureContent && (
          <span className="absolute left-1.5 top-1.5 rounded bg-black/70 px-1.5 py-0.5 font-sans text-[10px] font-semibold text-white">
            18+
          </span>
        )}
        <div className="absolute inset-x-0 bottom-0 flex items-center gap-1 bg-linear-to-t from-black/80 to-transparent px-2 pb-1.5 pt-4 font-sans text-[11px] font-medium text-white/90">
          <BookOpen size={11} />
          {formatReads(book.totalReads)}
        </div>
      </div>

      <h3 className="mt-2 line-clamp-2 font-display text-sm font-semibold leading-snug text-ink group-hover:text-accent">
        {book.title}
      </h3>
      <p className="mt-0.5 truncate font-sans text-xs text-ink-muted">{book.author.penName}</p>
      <div className="mt-1 flex items-center gap-1 font-sans text-xs text-ink-muted">
        <Star size={11} className="fill-gold text-gold" />
        {book?.averageRating?.toFixed(1)}
      </div>
    </Link>
  );
}