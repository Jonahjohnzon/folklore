"use client";

import Link from "next/link";
import { useState } from "react";
import { GENRES } from "@/app/lib/data";
import { cn } from "@/app/lib/utils";

export function Navbar() {
  const [activeGenre, setActiveGenre] = useState("All");
  const [searchVal, setSearchVal] = useState("");

  return (
    <header className="sticky top-0 z-50 bg-surface border-b-2 border-ink shadow-sm">
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-4 md:px-6 lg:px-8 h-14 border-b border-border-soft">
        {/* Tagline — hidden on mobile */}
        <p className="hidden lg:block text-2xs uppercase tracking-widest2 text-ink-muted font-medium">
          Stories that endure
        </p>

        {/* Wordmark */}
        <Link href="/" className="flex flex-col items-center leading-none group">
          <span className="font-serif text-2xl font-black text-ink tracking-tighter group-hover:text-crimson transition-colors">
            Lore
          </span>
          <span className="font-body italic text-2xs text-ink-faint hidden sm:block">
            Literature for the curious mind
          </span>
        </Link>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <label className="hidden md:flex items-center gap-2 border border-border bg-surface2 px-3 py-1.5 focus-within:border-ink-muted transition-colors">
            <svg className="w-3.5 h-3.5 text-ink-faint shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="search"
              placeholder="Search titles, authors…"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="bg-transparent text-xs text-ink placeholder:text-ink-faint outline-none w-40"
            />
          </label>

          <Link
            href="/auth/signin"
            className="hidden sm:block text-xs uppercase tracking-wider font-medium text-ink-mid border border-border px-4 py-1.5 hover:border-ink-mid transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/auth/register"
            className="text-xs uppercase tracking-wider font-semibold text-white bg-ink px-4 py-1.5 hover:bg-ink-mid transition-colors"
          >
            Start reading
          </Link>
        </div>
      </div>

      {/* ── Genre nav strip ── */}
      <nav className="overflow-x-auto scrollbar-hide">
        <ul className="flex items-center min-w-max px-4 md:px-6 lg:px-8">
          {GENRES.map((genre) => (
            <li key={genre}>
              <button
                onClick={() => setActiveGenre(genre)}
                className={cn(
                  "px-3.5 py-2.5 text-2xs uppercase tracking-widest font-medium whitespace-nowrap border-b-2 transition-all",
                  activeGenre === genre
                    ? "text-crimson border-crimson"
                    : "text-ink-muted border-transparent hover:text-ink"
                )}
              >
                {genre}
              </button>
            </li>
          ))}
          <li className="ml-auto pl-4">
            <Link
              href="/write"
              className="px-3.5 py-2.5 text-2xs uppercase tracking-widest font-semibold text-crimson border-b-2 border-transparent hover:border-crimson transition-all whitespace-nowrap"
            >
              ✍ Write
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}