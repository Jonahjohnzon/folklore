"use client";

import Link from "next/link";
import { BookOpen, Star, Eye } from "lucide-react";
import type { Book } from "@/lib/types";
import type { BookDTO } from "@/app/services/BookService";

const STATUS_LABEL: Partial<Record<Book["status"], string>> = {
  ongoing: "Ongoing",
  completed: "Completed",
  hiatus: "On hiatus",
  draft: "Draft",
};

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

// Deterministic fallback gradient for books without a cover image yet,
// so the grid still looks intentional instead of showing a broken image.
const FALLBACK_PALETTES = [
  { from: "#312e81", to: "#1e1b4b", ink: "#e0e7ff" },
  { from: "#7c2d12", to: "#431407", ink: "#fed7aa" },
  { from: "#134e4a", to: "#042f2e", ink: "#99f6e4" },
  { from: "#581c87", to: "#2e1065", ink: "#e9d5ff" },
  { from: "#7f1d1d", to: "#450a0a", ink: "#fecaca" },
];

function paletteForTitle(title: string) {
  let hash = 0;
  for (let i = 0; i < title.length; i++) hash = (hash * 31 + title.charCodeAt(i)) >>> 0;
  return FALLBACK_PALETTES[hash % FALLBACK_PALETTES.length];
}

function WorkCover({ book }: { book: BookDTO }) {
  if (book.coverUrl) {
    return (
      <div className="relative aspect-2/3 w-full overflow-hidden rounded-lg border border-hairline">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={book.coverUrl} alt={book.title} className="h-full w-full object-cover" loading="lazy" />
      </div>
    );
  }

  const palette = paletteForTitle(book.title);
  return (
    <div
      className="relative flex aspect-2/3 w-full flex-col justify-end overflow-hidden rounded-lg border border-white/10 p-3.5 shadow-md"
      style={{ background: `linear-gradient(155deg, ${palette.from}, ${palette.to})` }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.4) 3px, rgba(255,255,255,0.4) 4px)",
        }}
      />
      <h3
        className="relative font-display text-lg font-bold leading-tight text-balance"
        style={{ color: palette.ink }}
      >
        {book.title}
      </h3>
    </div>
  );
}

export function ProfileWorksGrid({ works }: { works: BookDTO[] }) {
  if (works.length === 0) {
    return (
      <div className="mt-10 rounded-xl border border-dashed border-hairline px-6 py-12 text-center">
        <BookOpen className="mx-auto text-ink-muted" size={22} />
        <p className="mt-3 font-sans text-sm text-ink-muted">No published works yet.</p>
      </div>
    );
  }

  return (
    <div className="mt-10">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-lg font-semibold text-ink">Published works</h2>
        <span className="font-sans text-xs text-ink-muted">
          {works.length} {works.length === 1 ? "story" : "stories"}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {works.map((book) => (
          <Link key={book._id} href={`/book/${book.slug}`} className="group flex flex-col gap-2">
            <div className="relative">
              <WorkCover book={book} />

              {book.matureContent && (
                <span className="absolute left-2 top-2 rounded bg-black/70 px-1.5 py-0.5 font-sans text-[10px] font-semibold text-white">
                  18+
                </span>
              )}

              <span className="absolute right-2 top-2 rounded-full bg-black/40 px-2 py-0.5 font-sans text-[9px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
                {STATUS_LABEL[book.status] ?? book.status}
              </span>

              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-lg bg-ink/0 opacity-0 transition group-hover:bg-ink/55 group-hover:opacity-100">
                <span className="flex items-center gap-1 font-sans text-xs font-semibold text-white">
                  <Eye size={13} /> {formatCount(book.totalReads)}
                </span>
                <span className="flex items-center gap-1 font-sans text-xs font-semibold text-white">
                  <Star size={13} className="fill-current" /> {book.averageRating.toFixed(1)}
                </span>
              </div>
            </div>

            <div className="px-0.5">
              <p className="truncate font-sans text-sm font-medium text-ink group-hover:text-accent">
                {book.title}
              </p>
              <p className="font-sans text-xs text-ink-muted">{book.totalChapters} chapters</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}