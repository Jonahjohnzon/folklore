// components/recommended-sidebar.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
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
        // Defensive filter: never show the book currently being read, even
        // if the backend query somehow includes it (wrong/stale bookId,
        // ObjectId/string cast mismatch, etc.). This should be a no-op if
        // the backend exclusion is working correctly.
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
    <aside className="w-full max-w-xs rounded-2xl border border-hairline bg-surface p-4">
      <h3 className="font-display text-sm font-semibold text-ink">You might also like</h3>

      {loading ? (
        <div className="mt-3 flex flex-col gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-5">
              <div className="h-20 w-20 shrink-0 animate-pulse rounded-md bg-hairline/30" />
              <div className="flex-1 space-y-1.5 py-1">
                <div className="h-3 w-10 animate-pulse rounded bg-hairline/30" />
                <div className="h-2.5 w-10 animate-pulse rounded bg-hairline/20" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-3 flex flex-col gap-3">
          {books.map((b) => (
            <Link
              key={b._id}
              href={`/book/${b.slug}`}
              className="flex gap-3 rounded-lg p-1 transition hover:bg-bg"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={b.coverUrl ?? "/placeholder-cover.png"}
                alt={b.title}
                className="h-20 w-18 shrink-0 rounded-md object-cover shadow-sm"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-sans text-sm font-semibold text-ink">{b.title}</p>
                <p className="truncate font-sans text-xs text-ink-muted">{b.author.penName}</p>
                <div className="mt-1 flex items-center gap-2 font-sans text-[11px] text-ink-muted">
                  {b.reviewCount > 0 && (
                    <span className="flex items-center gap-0.5">
                      <Star size={10} className="text-gold" /> {b.averageRating.toFixed(1)}
                    </span>
                  )}
                  <span>{formatCompactNumber(b.totalReads)} reads</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </aside>
  );
}