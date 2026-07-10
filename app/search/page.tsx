// app/search/page.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import {  useSearchParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import Link from "next/link";
import { Loader2, BookOpen, Tag as TagIcon, User as UserIcon } from "lucide-react";
import { SearchService, type FullSearchResults } from "@/app/services/SearchService";
import { Home } from "lucide-react";

type Tab = "all" | "books" | "authors" | "tags";

const TABS: { key: Tab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "books", label: "Books" },
  { key: "authors", label: "Authors" },
  { key: "tags", label: "Tags" },
];

function SearchPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams.get("q")?.trim() ?? "";
  const tab = (searchParams.get("type") as Tab) ?? "all";
  const page = Number(searchParams.get("page")) || 1;

  const [results, setResults] = useState<FullSearchResults | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (q.length < 2) {
      setResults(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    SearchService.fullSearch(q, { type: tab, page })
      .then(({ data }) => setResults(data))
      .catch(() => setResults(null))
      .finally(() => setLoading(false));
  }, [q, tab, page]);

  function setTab(next: Tab) {
    router.push(`/search?q=${encodeURIComponent(q)}&type=${next}`);
  }

  function setPage(next: number) {
    router.push(`/search?q=${encodeURIComponent(q)}&type=${tab}&page=${next}`);
  }

  if (q.length < 2) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="font-sans text-sm text-ink-muted">Type at least 2 characters to search.</p>
      </div>
    );
  }

  const totalHits = (results?.books.total ?? 0) + (results?.authors.total ?? 0) + (results?.tags.total ?? 0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center gap-3">
        <Link
            href="/"
            replace
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-hairline text-ink-muted transition hover:border-accent hover:text-accent"
            aria-label="Go to homepage"
        >
            <Home size={16} />
        </Link>
        <h1 className="font-serif text-2xl font-semibold text-ink">Results for &ldquo;{q}&rdquo;</h1>
        </div>
      {!loading && (
        <p className="mt-1 font-sans text-sm text-ink-muted">
          {totalHits} result{totalHits === 1 ? "" : "s"}
        </p>
      )}

      <div className="mt-5 flex gap-1 border-b border-hairline">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3.5 py-2 font-sans text-sm font-medium transition ${
              tab === t.key ? "border-b-2 border-accent text-ink" : "text-ink-muted hover:text-ink"
            }`}
          >
            {t.label}
            {results && t.key !== "all" && (
              <span className="ml-1.5 text-xs text-ink-muted">
                {results[t.key as Exclude<Tab, "all">].total}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <Loader2 size={20} className="animate-spin text-ink-muted" />
        </div>
      )}

      {!loading && results && (
        <div className="mt-6 space-y-8">
          {(tab === "all" || tab === "books") && results.books.items.length > 0 && (
            <Section
              title="Books"
              icon={<BookOpen size={14} />}
              showViewAll={tab === "all" && results.books.total > results.books.items.length}
              onViewAll={() => setTab("books")}
            >
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {results.books.items.map((b) => (
                  <Link key={b._id} href={`/book/${b.slug}`} className="group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={b.coverUrl ?? "/placeholder-cover.png"}
                      alt={b.title}
                      className="aspect-2/3 w-full rounded-lg object-cover"
                    />
                    <p className="mt-1.5 truncate font-sans text-sm font-medium text-ink group-hover:text-accent">
                      {b.title}
                    </p>
                    <p className="truncate font-sans text-xs text-ink-muted">{b.authorName}</p>
                  </Link>
                ))}
              </div>
            </Section>
          )}

          {(tab === "all" || tab === "authors") && results.authors.items.length > 0 && (
            <Section
              title="Authors"
              icon={<UserIcon size={14} />}
              showViewAll={tab === "all" && results.authors.total > results.authors.items.length}
              onViewAll={() => setTab("authors")}
            >
              <div className="space-y-1">
                {results.authors.items.map((a) => (
                  <Link key={a.username} href={`/u/${a.username}`} className="flex items-center gap-3 rounded-lg p-2 hover:bg-bg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={a.avatarUrl ?? "/placeholder-avatar.png"}
                      alt={a.displayName}
                      className="h-10 w-10 shrink-0 rounded-full object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-sans text-sm font-medium text-ink">{a.penName ?? a.displayName}</p>
                      <p className="truncate font-sans text-xs text-ink-muted">@{a.username}</p>
                    </div>
                    {a.isCreator && <UserIcon size={13} className="shrink-0 text-accent" />}
                  </Link>
                ))}
              </div>
            </Section>
          )}

          {(tab === "all" || tab === "tags") && results.tags.items.length > 0 && (
            <Section
              title="Tags"
              icon={<TagIcon size={14} />}
              showViewAll={tab === "all" && results.tags.total > results.tags.items.length}
              onViewAll={() => setTab("tags")}
            >
              <div className="flex flex-wrap gap-2">
                {results.tags.items.map((t) => (
                  <Link
                    key={t.slug}
                    href={`/browse/${t.slug}`}
                    className="rounded-full border border-hairline px-3 py-1.5 font-sans text-sm text-ink transition hover:border-accent hover:text-accent"
                  >
                    {t.name}
                  </Link>
                ))}
              </div>
            </Section>
          )}

          {totalHits === 0 && (
            <p className="py-12 text-center font-sans text-sm text-ink-muted">No results for &ldquo;{q}&rdquo;</p>
          )}

          {tab !== "all" && (
            <Pagination page={page} total={results[tab].total} pageSize={results.pageSize} onChange={setPage} />
          )}
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  icon,
  showViewAll,
  onViewAll,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  showViewAll: boolean;
  onViewAll: () => void;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 font-sans text-sm font-semibold uppercase tracking-wide text-ink-muted">
          {icon} {title}
        </h2>
        {showViewAll && (
          <button onClick={onViewAll} className="font-sans text-sm font-medium text-accent hover:underline">
            View all
          </button>
        )}
      </div>
      {children}
    </section>
  );
}

function Pagination({ page, total, pageSize, onChange }: { page: number; total: number; pageSize: number; onChange: (p: number) => void }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-3 pt-4">
      <button
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="rounded-lg border border-hairline px-3 py-1.5 font-sans text-sm text-ink disabled:opacity-40"
      >
        Previous
      </button>
      <span className="font-sans text-sm text-ink-muted">Page {page} of {totalPages}</span>
      <button
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className="rounded-lg border border-hairline px-3 py-1.5 font-sans text-sm text-ink disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchPageInner />
    </Suspense>
  );
}