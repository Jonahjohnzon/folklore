"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Pause, Play } from "lucide-react";
import type { Book } from "@/lib/types";

const SLIDE_MS = 5000;

export function TrendingCarousel({ books }: { books: Book[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progressKey, setProgressKey] = useState(0);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % books.length);
      setProgressKey((k) => k + 1);
    }, SLIDE_MS);
    return () => clearInterval(t);
  }, [paused, books.length]);

  function goTo(i: number) {
    setIndex(i);
    setProgressKey((k) => k + 1);
  }

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) {
      goTo((index + (delta < 0 ? 1 : -1) + books.length) % books.length);
    }
    touchStartX.current = null;
  }

  const book = books[index];

  return (
    <section
      className="relative overflow-hidden border-b border-hairline"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div key={book.id} className="animate-[fadein_0.5s_ease]">
          <span className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            Trending now · #{index + 1}
          </span>
          <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-ink sm:text-5xl">
            {book.title}
          </h1>
          <p className="mt-4 max-w-lg font-body text-base leading-relaxed text-ink-muted sm:text-lg line-clamp-3 ">
            {book.description}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href={`/book/${book.slug}`}
              className="flex items-center gap-1.5 rounded-full bg-accent px-5 py-2.5 font-sans text-sm font-semibold text-accent-ink transition hover:opacity-90"
            >
              Start reading <ArrowRight size={15} />
            </Link>
            <span className="font-sans text-sm text-ink-muted">
              by <span className="font-medium text-ink">{book.author.penName}</span> · {book.totalChapters} chapters
            </span>
          </div>
        </div>

        <div className="relative mx-auto w-48 sm:w-60">
          <div className="absolute -inset-3 -z-10 rounded-2xl bg-accent/10 blur-xl" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={book.id}
            src={book.coverUrl}
            alt={book.title}
            className="aspect-2/3 w-full animate-[fadein_0.5s_ease] rounded-xl border border-hairline object-cover shadow-2xl"
          />
        </div>
      </div>

      {/* Controls */}
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 pb-5 sm:px-6">
        <button
          onClick={() => setPaused((p) => !p)}
          aria-label={paused ? "Resume autoplay" : "Pause autoplay"}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-hairline text-ink-muted hover:border-accent hover:text-accent"
        >
          {paused ? <Play size={11} /> : <Pause size={11} />}
        </button>

        <div className="flex items-center gap-1.5">
          {books.map((b, i) => (
            <button
              key={b.id}
              onClick={() => goTo(i)}
              aria-label={`Show ${b.title}`}
              aria-current={i === index}
              className="relative h-1.5 w-7 overflow-hidden rounded-full bg-hairline"
            >
              {i === index && (
                <span
                  key={progressKey}
                  className="absolute inset-y-0 left-0 block rounded-full bg-accent"
                  style={{
                    animation: paused ? "none" : `slideProgress ${SLIDE_MS}ms linear forwards`,
                    width: paused ? "100%" : undefined,
                  }}
                />
              )}
              {i < index && <span className="absolute inset-0 rounded-full bg-accent" />}
            </button>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes slideProgress {
          from { width: 0%; }
          to { width: 100%; }
        }
        @keyframes fadein {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
