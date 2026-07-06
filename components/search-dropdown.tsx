// components/search-dropdown.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Loader2, BookOpen, User as UserIcon, Tag as TagIcon } from "lucide-react";
import { SearchService, type SearchResults } from "@/app/services/SearchService";
import { SignalService } from "@/app/services/SignalService"; // ← add this import

const EMPTY: SearchResults = { books: [], authors: [], tags: [] };

export function SearchBox({ autoFocus = false, onNavigate }: { autoFocus?: boolean; onNavigate?: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults(EMPTY);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(() => {
      SearchService.search(trimmed)
        .then(({ data }) => {
          setResults(data);
          // fires once per debounced search, only after results actually come
          // back — not on every keystroke, so this reflects real searches
          SignalService.log("search_query", { payload: { query: trimmed } });
        })
        .catch(() => setResults(EMPTY))
        .finally(() => setLoading(false));
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  function goToFullResults() {
    const trimmed = query.trim();
    if (!trimmed) return;
    setOpen(false);
    onNavigate?.();
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  const hasAnyResults = results.books.length > 0 || results.authors.length > 0 || results.tags.length > 0;
  const showDropdown = open && query.trim().length >= 2;

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="flex w-full items-center gap-2 rounded-full border border-hairline bg-bg px-3.5 py-2 text-sm text-ink-muted focus-within:border-accent">
        <Search size={15} />
        <input
          autoFocus={autoFocus}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => e.key === "Enter" && goToFullResults()}
          placeholder="Search titles, authors, tags…"
          className="w-full bg-transparent font-sans text-sm text-ink placeholder:text-ink-muted focus:outline-none"
        />
        {loading && <Loader2 size={14} className="shrink-0 animate-spin text-ink-muted" />}
      </div>

      {showDropdown && (
        <div className="absolute left-0 right-0 z-50 mt-2 max-h-96 overflow-y-auto rounded-xl border border-hairline bg-surface-raised shadow-xl">
          {!loading && !hasAnyResults && (
            <p className="px-4 py-6 text-center font-sans text-sm text-ink-muted">
              No results for &ldquo;{query.trim()}&rdquo;
            </p>
          )}

          {results.books.length > 0 && (
            <div className="p-1.5">
              <p className="px-2.5 pb-1 pt-1 font-sans text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                Books
              </p>
              {results.books.map((b) => (
                <Link
                  key={b._id}
                  href={`/book/${b.slug}`}
                  onClick={() => {
                    setOpen(false);
                    onNavigate?.();
                  }}
                  className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 transition hover:bg-bg"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={b.coverUrl ?? "/placeholder-cover.png"}
                    alt={b.title}
                    className="h-10 w-7 shrink-0 rounded object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-sans text-sm font-medium text-ink">{b.title}</p>
                    <p className="truncate font-sans text-xs text-ink-muted">{b.authorName}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {results.authors.length > 0 && (
            <div className="border-t border-hairline p-1.5">
              <p className="px-2.5 pb-1 pt-1 font-sans text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                Authors
              </p>
              {results.authors.map((a) => (
                <Link
                  key={a.username}
                  href={`/u/${a.username}`}
                  onClick={() => {
                    setOpen(false);
                    onNavigate?.();
                  }}
                  className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 transition hover:bg-bg"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={a.avatarUrl ?? "/placeholder-avatar.png"}
                    alt={a.displayName}
                    className="h-8 w-8 shrink-0 rounded-full object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-sans text-sm font-medium text-ink">
                      {a.penName ?? a.displayName}
                    </p>
                    <p className="truncate font-sans text-xs text-ink-muted">@{a.username}</p>
                  </div>
                  {a.isCreator && <UserIcon size={13} className="shrink-0 text-accent" />}
                </Link>
              ))}
            </div>
          )}

          {results.tags.length > 0 && (
            <div className="border-t border-hairline p-1.5">
              <p className="px-2.5 pb-1 pt-1 font-sans text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                Tags
              </p>
              {results.tags.map((t) => (
                <Link
                  key={t.slug}
                  href={`/browse/${t.slug}`}
                  onClick={() => {
                    setOpen(false);
                    onNavigate?.();
                    SignalService.log("tag_clicked", { payload: { tagSlug: t.slug, tagName: t.name } }); // ← add this
                  }}
                  className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 transition hover:bg-bg"
                >
                  <TagIcon size={14} className="shrink-0 text-ink-muted" />
                  <span className="font-sans text-sm text-ink">{t.name}</span>
                </Link>
              ))}
            </div>
          )}

          {hasAnyResults && (
            <button
              onClick={goToFullResults}
              className="flex w-full items-center justify-center gap-1.5 border-t border-hairline px-4 py-2.5 font-sans text-sm font-medium text-accent transition hover:bg-bg"
            >
              <BookOpen size={13} /> See all results for &ldquo;{query.trim()}&rdquo;
            </button>
          )}
        </div>
      )}
    </div>
  );
}