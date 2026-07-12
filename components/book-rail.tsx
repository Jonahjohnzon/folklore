"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { ChevronRight, ChevronLeft } from "lucide-react";
import type { Book } from "@/lib/types";
import { BookCard } from "./book-card";

export function BookRail({
  title,
  subtitle,
  books,
  href,
  rank = false,
}: {
  title: string;
  subtitle?: string;
  books: Book[];
  href?: string;
  rank?: boolean;
}) {
  const railRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = railRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
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
        {canScrollLeft && (
          <button
            onClick={() => scrollByAmount("left")}
            aria-label="Scroll left"
            className="absolute left-0 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full border border-hairline bg-surface p-2 text-ink shadow-md transition hover:border-accent hover:text-accent sm:flex"
          >
            <ChevronLeft size={18} />
          </button>
        )}

        {/* Edge fade so the button doesn't feel like it's floating on bare cards */}
        {canScrollLeft && (
          <div className="pointer-events-none absolute left-0 top-0 z-10 hidden h-full w-16 bg-linear-to-r from-bg to-transparent sm:block" />
        )}
        {canScrollRight && (
          <div className="pointer-events-none absolute right-0 top-0 z-10 hidden h-full w-16 bg-linear-to-l from-bg to-transparent sm:block" />
        )}

        <div
          ref={railRef}
          className="rail flex gap-4 overflow-x-auto scroll-smooth scrollbar-none pb-2"
        >
          {books.map((b, i) => (
            <div key={b.id} className="relative shrink-0">
              {rank && (
                <span className="pointer-events-none absolute -left-1 -top-1 z-10 font-display text-3xl font-bold text-surface [-webkit-text-stroke:1.5px_var(--accent)] sm:text-4xl">
                  {i + 1}
                </span>
              )}
              <BookCard book={b} />
            </div>
          ))}
        </div>

        {canScrollRight && (
          <button
            onClick={() => scrollByAmount("right")}
            aria-label="Scroll right"
            className="absolute right-0 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full border border-hairline bg-surface p-2 text-ink shadow-md transition hover:border-accent hover:text-accent sm:flex"
          >
            <ChevronRight size={18} />
          </button>
        )}
      </div>
    </section>
  );
}