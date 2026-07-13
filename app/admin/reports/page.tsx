"use client";

import { useEffect, useState, useCallback } from "react";
import { Flag, ExternalLink, Loader2 } from "lucide-react";

type ReportStatus = "open" | "reviewing" | "resolved" | "dismissed";

interface Report {
  id: string;
  type: string;
  reason: string;
  url?: string;
  description: string;
  email?: string;
  status: ReportStatus;
  createdAt: string;
}

const STATUS_TABS: { value: ReportStatus | "all"; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "reviewing", label: "Reviewing" },
  { value: "resolved", label: "Resolved" },
  { value: "dismissed", label: "Dismissed" },
  { value: "all", label: "All" },
];

const STATUS_STYLES: Record<ReportStatus, string> = {
  open: "border-red-300 bg-red-50 text-red-700",
  reviewing: "border-amber-300 bg-amber-50 text-amber-700",
  resolved: "border-emerald-300 bg-emerald-50 text-emerald-700",
  dismissed: "border-hairline bg-surface text-ink-muted",
};

export default function AdminReportsPage() {
  const [tab, setTab] = useState<ReportStatus | "all">("open");
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

 const load = useCallback(async (status: ReportStatus | "all", pageNum: number) => {
  setLoading(true);
  try {
    const params = new URLSearchParams({ page: String(pageNum) });
    if (status !== "all") params.set("status", status);
    const res = await fetch(`/api/admin/reports?${params}`);
    const data = await res.json();
    setReports(data.data?.reports ?? []);
    setTotalPages(data.data?.totalPages ?? 1);
  } finally {
    setLoading(false);
  }
    }, []);

    useEffect(() => {
    load(tab, page);
    }, [tab, page, load]);

    // reset to page 1 whenever the status tab changes
    useEffect(() => {
    setPage(1);
    }, [tab]);

  async function updateStatus(id: string, status: ReportStatus) {
    setUpdatingId(id);
    try {
      await fetch("/api/admin/reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      setReports((prev) => prev.filter((r) => r.id !== id || tab === "all"));
      setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex items-center gap-2">
        <Flag size={18} className="text-accent" />
        <h1 className="font-display text-2xl font-bold text-ink">Reports</h1>
      </div>

      <div className="mt-5 flex gap-1.5 border-b border-hairline pb-3">
        {STATUS_TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`rounded-full px-3 py-1.5 font-sans text-xs font-medium transition ${
              tab === t.value ? "bg-accent text-accent-ink" : "text-ink-muted hover:bg-surface"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={22} className="animate-spin text-ink-muted" />
        </div>
      ) : reports.length === 0 ? (
        <p className="py-16 text-center font-sans text-sm text-ink-muted">No reports here.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {reports.map((r) => (
            <div key={r.id} className="rounded-lg border border-hairline bg-surface p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full border px-2 py-0.5 font-sans text-[11px] font-semibold ${STATUS_STYLES[r.status]}`}>
                  {r.status}
                </span>
                <span className="font-sans text-xs font-semibold text-ink">{r.type}</span>
                <span className="font-sans text-xs text-ink-muted">·</span>
                <span className="font-sans text-xs text-ink-muted">{r.reason.replace(/_/g, " ")}</span>
                <span className="ml-auto font-sans text-[11px] text-ink-muted">
                  {new Date(r.createdAt).toLocaleString()}
                </span>
              </div>

              <p className="mt-2 whitespace-pre-wrap font-sans text-sm text-ink">{r.description}</p>

              <div className="mt-2 flex flex-wrap items-center gap-3 font-sans text-xs text-ink-muted">
                {r.url && (
                  <a href={r.url} target="_blank" className="flex items-center gap-1 text-accent hover:underline">
                    View content <ExternalLink size={11} />
                  </a>
                )}
                {r.email && <span>Reporter: {r.email}</span>}
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {(["reviewing", "resolved", "dismissed"] as ReportStatus[])
                  .filter((s) => s !== r.status)
                  .map((s) => (
                    <button
                      key={s}
                      disabled={updatingId === r.id}
                      onClick={() => updateStatus(r.id, s)}
                      className="rounded-full border border-hairline px-3 py-1 font-sans text-xs font-medium text-ink transition hover:border-accent disabled:opacity-50"
                    >
                      Mark {s}
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
            {!loading && reports.length > 0 && totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3 font-sans text-sm text-ink-muted">
            <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-full border border-hairline px-3 py-1 disabled:opacity-40"
            >
            Prev
            </button>
            <span>Page {page} of {totalPages}</span>
            <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-full border border-hairline px-3 py-1 disabled:opacity-40"
            >
            Next
            </button>
        </div>
        )}
    </main>
  );
}