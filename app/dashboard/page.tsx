// app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Home, BookOpen, Star, Layers, TrendingUp, Sparkles, Loader2 } from "lucide-react";
import { BookSummaryCard } from "@/components/book-summary-card";
import { DashboardService, type DashboardStats, type CreatorBookDTO } from "@/app/services/DashboardService";
import { formatCompactNumber } from "@/lib/format";

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-hairline bg-surface p-5 shadow-sm">
      <div className="flex items-center gap-2 font-sans text-xs font-semibold uppercase tracking-wide text-ink-muted">
        <Icon size={14} /> {label}
      </div>
      <p className="mt-3 font-display text-3xl font-bold text-ink">{value}</p>
    </div>
  );
}

function ComingSoonCard({ title, note }: { title: string; note: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-hairline bg-surface p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
        <span className="flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-1 font-sans text-[11px] font-semibold text-accent">
          <Sparkles size={11} /> Coming soon
        </span>
      </div>
      <p className="mt-2 max-w-sm font-sans text-sm text-ink-muted">{note}</p>
      <div className="mt-5 h-24 rounded-xl border border-dashed border-hairline bg-bg/60" />
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [books, setBooks] = useState<CreatorBookDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    DashboardService.getOverview()
      .then(({ data }) => {
        if (cancelled) return;
        setStats(data.stats);
        setBooks(data.books);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Couldn't load your dashboard.");
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center gap-2 text-ink-muted">
        <Loader2 size={20} className="animate-spin" />
        <span className="font-sans text-sm">Loading your dashboard…</span>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/"
          aria-label="Home"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-hairline text-ink-muted transition hover:border-accent hover:text-accent"
        >
          <Home size={16} />
        </Link>
        <div>
          <p className="font-sans text-xs font-semibold uppercase tracking-wide text-ink-muted">Creator dashboard</p>
          <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">Your books at a glance</h1>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-3.5 py-2 font-sans text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={BookOpen} label="Total reads" value={formatCompactNumber(stats?.totalReads ?? 0)} />
        <StatCard icon={Layers} label="Chapters published" value={formatCompactNumber(stats?.totalChapters ?? 0)} />
        <StatCard icon={TrendingUp} label="Books" value={String(stats?.totalBooks ?? 0)} />
        <StatCard icon={Star} label="Avg. rating" value={stats && stats.avgRating > 0 ? stats.avgRating.toFixed(1) : "—"} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border border-hairline bg-surface">
          <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
            <h2 className="font-display text-lg font-semibold text-ink">Your books</h2>
            <Link
              href="/write"
              className="rounded-full bg-accent px-3.5 py-1.5 font-sans text-sm font-semibold text-accent-ink transition hover:opacity-90"
            >
              + New book
            </Link>
          </div>
          <div className="divide-y divide-hairline">
            {books.length === 0 ? (
              <p className="px-5 py-10 text-center font-sans text-sm text-ink-muted">
                No books yet — start your first one.
              </p>
            ) : (
              books.map((b) => <BookSummaryCard key={b._id} book={b} />)
            )}
          </div>
        </div>


        <aside className="flex flex-col gap-4">
        <div className="rounded-2xl border border-hairline bg-surface p-5">
          <h2 className="font-display text-lg font-semibold text-ink">Followers</h2>
          <p className="mt-3 font-display text-3xl font-bold text-ink">
            {formatCompactNumber(stats?.followerCount ?? 0)}
          </p>
          <p className="mt-1 font-sans text-xs text-ink-muted">People following you as an author</p>
        </div>
          <ComingSoonCard
            title="Earnings"
            note="Ad revenue, coin unlocks, and payouts will show up here once monetization tracking is live."
          />
        </aside>
      </div>
    </main>
  );
}