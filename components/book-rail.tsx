"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Book } from "@/lib/types";
import { BookCard } from "./book-card";

export function BookRail({
  title,
  subtitle,
  books,
  href,
  rank = false,
  pattern = "default",
}: {
  title: string;
  subtitle?: string;
  books: Book[];
  href?: string;
  rank?: boolean;
  pattern?: "default" | "big-stacked";
}) {
  const railRef = useRef<HTMLDivElement>(null);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = railRef.current;
    if (!el) return;
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = railRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    // Re-check on resize (e.g. rotating a tablet, or window resize revealing more cards)
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      ro.disconnect();
    };
  }, [updateScrollState, books]);

  function scrollByAmount(dir: "left" | "right") {
    const el = railRef.current;
    if (!el) return;
    // Scroll by ~90% of the visible width so the next card peeking at the
    // edge stays partially visible as a "there's more" cue.
    const amount = el.clientWidth * 0.9 * (dir === "left" ? -1 : 1);
    el.scrollBy({ left: amount, behavior: "smooth" });
  }

  // Group into [big, small, small] triples for the big-stacked pattern
  const groups: Book[][] = [];
  if (pattern === "big-stacked") {
    for (let i = 0; i < books.length; i += 3) {
      groups.push(books.slice(i, i + 3));
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="mb-3 flex items-end justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold text-ink sm:text-2xl">{title}</h2>
          {subtitle && <p className="mt-0.5 font-sans text-sm text-ink-muted">{subtitle}</p>}
        </div>
        {href && (
          <Link href={href} className="flex shrink-0 items-center gap-0.5 font-sans text-sm font-medium text-accent">
            See all <ChevronRight size={15} />
          </Link>
        )}
      </div>

      <div className="group/rail relative">
        <div
          ref={railRef}
          className="rail flex gap-3 overflow-x-auto scroll-smooth scrollbar-none pb-2"
        >
          {pattern === "big-stacked"
            ? groups.map((group, gi) => (
                <div key={gi} className="flex h-56 shrink-0 gap-2 sm:h-64">
                  {group[0] && (
                    <div className="relative">
                      {rank && (
                        <span className="pointer-events-none absolute -left-1 -top-1 z-10 font-display text-3xl font-bold text-surface [-webkit-text-stroke:1.5px_var(--accent)] sm:text-4xl">
                          {gi * 3 + 1}
                        </span>
                      )}
                      <BookCard book={group[0]} size="cover-big" />
                    </div>
                  )}
                  {(group[1] || group[2]) && (
                  <div className="flex h-full flex-col gap-2">
                    {group[1] && <BookCard book={group[1]} size="cover-stacked" />}
                    {group[2] && <BookCard book={group[2]} size="cover-stacked" />}
                  </div>
                )}
                </div>
              ))
            : books.map((b, i) => (
                <div key={b.id} className="relative shrink-0">
                  {rank && (
                    <span className="pointer-events-none absolute -left-1 -top-1 z-10 font-display text-3xl font-bold text-surface [-webkit-text-stroke:1.5px_var(--accent)] sm:text-4xl">
                      {i + 1}
                    </span>
                  )}
                  <BookCard book={b} big/>
                </div>
              ))}
        </div>

        {canScrollRight && (
          <button
            onClick={() => scrollByAmount("right")}
            aria-label="Scroll right"
            className="absolute right-2 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full bg-surface p-2 text-ink shadow-md transition hover:text-accent sm:flex"
          >
            <ChevronRight size={18} />
          </button>
        )}
      </div>
    </section>
  );
}