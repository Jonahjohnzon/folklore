// app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Home, BookOpen, Star, Layers,Target, TrendingUp, TrendingDown, Loader2, Coins, ChevronLeft, ChevronRight } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { BookSummaryCard } from "@/components/book-summary-card";
import {
  DashboardService,
  type DashboardStats,
  type CreatorBookDTO,
  type DashboardAnalytics,
} from "@/app/services/DashboardService";
import { formatCompactNumber } from "@/lib/format";

const BOOKS_PER_PAGE =5;

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

function short(value: React.ReactNode) {
  if (typeof value !== "string") return "";
  const d = new Date(value + "T00:00:00Z");
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// keeps the Y-axis column narrow even when earnings/reads hit the thousands —
// unbounded numbers here is exactly what pushes chart width past its grid track
function compactTick(v: number) {
  return formatCompactNumber(v);
}

function ChartCard({
  title,
  right,
  children,
  footnote,
}: {
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  footnote?: React.ReactNode;
}) {
  return (
    // min-w-0 is load-bearing: without it, a grid/flex item won't shrink
    // below its content's intrinsic width, so ResponsiveContainer's SVG
    // can force the card (and the whole row) wider than the viewport
    <div className="min-w-0 overflow-hidden rounded-2xl border border-hairline bg-surface p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="truncate font-display text-lg font-semibold text-ink">{title}</h2>
        {right}
      </div>
      <div className="mt-4 h-56 min-w-0">{children}</div>
      {footnote}
    </div>
  );
}

function RangeToggle({
  value,
  onChange,
}: {
  value: 7 | 30 | 90;
  onChange: (v: 7 | 30 | 90) => void;
}) {
  return (
    <div className="flex items-center gap-1 rounded-full border border-hairline p-0.5">
      {[7, 30, 90].map((r) => (
        <button
          key={r}
          onClick={() => onChange(r as 7 | 30 | 90)}
          className={`rounded-full px-2.5 py-1 font-sans text-xs font-semibold transition ${
            value === r ? "bg-accent text-accent-ink" : "text-ink-muted hover:text-ink"
          }`}
        >
          {r}d
        </button>
      ))}
    </div>
  );
}

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid var(--hairline, #e5e5e5)",
  fontSize: 12,
  fontFamily: "inherit",
  maxWidth: 220,
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [books, setBooks] = useState<CreatorBookDTO[]>([]);
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [range, setRange] = useState<7 | 30 | 90>(30);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
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

  useEffect(() => {
    let cancelled = false;
    setAnalyticsLoading(true);
    DashboardService.getAnalytics(range)
      .then(({ data }) => {
        if (!cancelled) setAnalytics(data);
      })
      .catch(() => {
        // analytics failing shouldn't blank out the rest of the dashboard
      })
      .finally(() => !cancelled && setAnalyticsLoading(false));
    return () => {
      cancelled = true;
    };
  }, [range]);

  if (loading) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center gap-2 text-ink-muted">
        <Loader2 size={20} className="animate-spin" />
        <span className="font-sans text-sm">Loading your dashboard…</span>
      </main>
    );
  }

  const trendUp = (analytics?.earningsTrendPct ?? 0) >= 0;
  const totalPages = Math.max(1, Math.ceil(books.length / BOOKS_PER_PAGE));
  const pagedBooks = books.slice((page - 1) * BOOKS_PER_PAGE, page * BOOKS_PER_PAGE);

  return (
    <main className="mx-auto max-w-7xl overflow-x-hidden px-4 py-6 sm:px-6">
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

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <StatCard icon={BookOpen} label="Total reads" value={formatCompactNumber(stats?.totalReads ?? 0)} />
        <StatCard icon={Layers} label="Chapters published" value={formatCompactNumber(stats?.totalChapters ?? 0)} />
        <StatCard icon={TrendingUp} label="Books" value={String(stats?.totalBooks ?? 0)} />
        <StatCard icon={Star} label="Avg. rating" value={stats && stats.avgRating > 0 ? stats.avgRating.toFixed(1) : "—"} />
          <StatCard icon={Target} label="Avg. completion rate" value={analytics ? `${analytics.overallCompletionRate}%` : "—"}/>
      </div>

      {/* ── Analytics ─────────────────────────────────────── */}
      <div className="mt-6 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-ink">Performance</h2>
        <RangeToggle value={range} onChange={setRange} />
      </div>

      <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard
          title="Daily reads"
          footnote={
            analytics && !analytics.readsInstrumented ? (
              <p className="mt-2 font-sans text-xs text-ink-muted">
                Read tracking just went live — this fills in day by day from here.
              </p>
            ) : undefined
          }
        >
          {analyticsLoading || !analytics ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.readsByDay} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
                <defs>
                  <linearGradient id="readsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent, #6366f1)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--accent, #6366f1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                <XAxis dataKey="date" tickFormatter={short} fontSize={11} interval="preserveStartEnd" minTickGap={24} />
                <YAxis fontSize={11} width={36} allowDecimals={false} tickFormatter={compactTick} />
                <Tooltip labelFormatter={short} contentStyle={tooltipStyle} />
                <Area
                  type="monotone"
                  dataKey="reads"
                  stroke="var(--accent, #6366f1)"
                  strokeWidth={2}
                  fill="url(#readsFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard
          title="Earnings from unlocks"
          right={
            analytics && (
              <span
                className={`flex shrink-0 items-center gap-1 font-sans text-xs font-semibold ${
                  trendUp ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {Math.abs(analytics.earningsTrendPct)}%
              </span>
            )
          }
        >
          {analyticsLoading || !analytics ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.earningsByDay} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                <XAxis dataKey="date" tickFormatter={short} fontSize={11} interval="preserveStartEnd" minTickGap={24} />
                <YAxis fontSize={11} width={36} allowDecimals={false} tickFormatter={compactTick} />
                <Tooltip
                  labelFormatter={short}
                  formatter={(v) => [`${v ?? 0} coins`, "Earned"]}
                  contentStyle={tooltipStyle}
                />
                <Bar dataKey="coins" fill="var(--accent, #6366f1)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        <ChartCard title="Follower growth">
          {analyticsLoading || !analytics ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.followersByDay} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                <XAxis dataKey="date" tickFormatter={short} fontSize={11} interval="preserveStartEnd" minTickGap={24} />
                <YAxis fontSize={11} width={36} allowDecimals={false} tickFormatter={compactTick} />
                <Tooltip labelFormatter={short} contentStyle={tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="followers"
                  stroke="var(--accent, #6366f1)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <div className="min-w-0 overflow-hidden rounded-2xl border border-hairline bg-surface p-5">
          <div className="flex items-center gap-2 font-sans text-xs font-semibold uppercase tracking-wide text-ink-muted">
            <Coins size={14} /> Top earning chapters
          </div>
          {analyticsLoading || !analytics ? (
            <div className="mt-3 space-y-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-9 animate-pulse rounded-lg bg-bg/60" />
              ))}
            </div>
          ) : analytics.topChapters.length === 0 ? (
            <p className="mt-3 font-sans text-sm text-ink-muted">No unlocks yet in this range.</p>
          ) : (
            <ul className="mt-3 divide-y divide-hairline">
              {analytics.topChapters.map((c, i) => (
                <li key={c.chapterId} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate font-sans text-sm font-medium text-ink">
                      {i + 1}. {c.title}
                    </p>
                    <p className="truncate font-sans text-xs text-ink-muted">{c.bookTitle}</p>
                  </div>
                  <span className="shrink-0 font-sans text-sm font-semibold text-ink">
                    {formatCompactNumber(c.coins)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* ── Books + follower total ────────────────────────── */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 rounded-2xl border border-hairline bg-surface">
          <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
            <h2 className="font-display text-lg font-semibold text-ink">Your books</h2>
            <Link
              href="/write"
              className="shrink-0 rounded-full bg-accent px-3.5 py-1.5 font-sans text-sm font-semibold text-accent-ink transition hover:opacity-90"
            >
              + New book
            </Link>
          </div>

          {books.length === 0 ? (
            <p className="px-5 py-10 text-center font-sans text-sm text-ink-muted">
              No books yet — start your first one.
            </p>
          ) : (
            <>
              <div className="divide-y divide-hairline">
                {pagedBooks.map((b) => (
                  <BookSummaryCard key={b._id} book={b} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-hairline px-5 py-3">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    aria-label="Previous page"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-hairline text-ink-muted transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-hairline disabled:hover:text-ink-muted"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="font-sans text-xs text-ink-muted">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    aria-label="Next page"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-hairline text-ink-muted transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-hairline disabled:hover:text-ink-muted"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <aside className="flex flex-col gap-4">
          <div className="rounded-2xl border border-hairline bg-surface p-5">
            <h2 className="font-display text-lg font-semibold text-ink">Followers</h2>
            <p className="mt-3 font-display text-3xl font-bold text-ink">
              {formatCompactNumber(stats?.followerCount ?? 0)}
            </p>
            <p className="mt-1 font-sans text-xs text-ink-muted">People following you as an author</p>
          </div>
        </aside>
      </div>
    </main>
  );
}

function ChartSkeleton() {
  return <div className="h-full w-full animate-pulse rounded-xl bg-bg/60" />;
}