// components/recommended-sidebar.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, BookOpen } from "lucide-react";
import { RecommendationService, type RecommendedBookDTO } from "@/app/services/RecommendationService";
import { formatCompactNumber } from "@/lib/format";

export function RecommendedSidebar({ bookId }: { bookId: string }) {
  const [books, setBooks] = useState<RecommendedBookDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    RecommendationService.getForBook(bookId)
      .then(({ data }) => {
        if (cancelled) return;
        setBooks(data.books.filter((b) => b._id !== bookId));
      })
      .catch(() => {
        if (!cancelled) setBooks([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [bookId]);

  if (!loading && books.length === 0) return null;

  return (
<aside className="sticky top-24 w-full max-w-sm self-start rounded-2xl border border-hairline bg-surface p-5 shadow-sm">      <h3 className="font-display text-base font-bold text-ink">You might also like</h3>
      <p className="mt-0.5 font-sans text-xs text-ink-muted">Readers of this book also enjoyed</p>

      {loading ? (
        <div className="mt-5 flex flex-col gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="h-36 w-28 shrink-0 animate-pulse rounded-lg bg-hairline/30" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-3.5 w-full animate-pulse rounded bg-hairline/30" />
                <div className="h-3.5 w-3/4 animate-pulse rounded bg-hairline/30" />
                <div className="h-2.5 w-1/2 animate-pulse rounded bg-hairline/20" />
                <div className="mt-3 h-2.5 w-2/3 animate-pulse rounded bg-hairline/20" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-5 flex flex-col gap-5">
          {books.map((b, i) => (
            <Link
              key={b._id}
              href={`/book/${b.slug}`}
              className="group flex gap-4 rounded-xl p-1.5 transition hover:bg-bg"
            >
              <div className="relative shrink-0">
                <span className="absolute -left-2 -top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-accent font-sans text-[10px] font-bold text-accent-ink">
                  {i + 1}
                </span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                src={b.coverUrl ?? "/placeholder-cover.png"}
                alt={b.title}
                className="h-36 w-28 rounded-lg object-cover shadow-md transition group-hover:shadow-lg"
              />
              </div>
              <div className="min-w-0 flex-1 py-1">
                <p className="line-clamp-2 font-sans text-sm font-semibold leading-snug text-ink group-hover:text-accent">
                  {b.title}
                </p>
                <p className="mt-1 truncate font-sans text-xs text-ink-muted">{b.author.penName}</p>
                <div className="mt-2.5 flex items-center gap-3 font-sans text-[11px] text-ink-muted">
                  {b.reviewCount > 0 && (
                    <span className="flex items-center gap-1">
                      <Star size={11} className="fill-gold text-gold" /> {b.averageRating.toFixed(1)}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <BookOpen size={11} /> {formatCompactNumber(b.totalReads)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </aside>
  );
}