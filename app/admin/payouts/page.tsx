// app/admin/payouts/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff, Download, CheckCircle2, Loader2 } from "lucide-react";
import { AdminService, type AdminPayoutAccountRow } from "@/app/services/AdminService";
import { PayoutRequestsTable } from "@/components/admin/payout-requests-table";
import { DropdownSelect } from "@/app/components/ui/dropdown-select";

const METHOD_OPTIONS = [
  { value: "" as const, label: "All methods" },
  { value: "bank" as const, label: "Bank" },
  { value: "crypto" as const, label: "Crypto" },
];

export default function AdminPayoutsPage() {
  const [rows, setRows] = useState<AdminPayoutAccountRow[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [method, setMethod] = useState<"" | "bank" | "crypto">("");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [revealed, setRevealed] = useState<Record<string, { accountNumber: string | null; walletAddress: string | null }>>({});
  const [revealingId, setRevealingId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  function load(pageToLoad: number) {
    setLoading(true);
    AdminService.getPayoutAccounts(pageToLoad, { method: method || undefined, q: q || undefined })
      .then((res) => {
        setRows(res.data.accounts);
        setHasMore(res.data.hasMore);
        setPage(pageToLoad);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [method]);

  async function toggleReveal(id: string) {
    if (revealed[id]) {
      setRevealed((r) => {
        const next = { ...r };
        delete next[id];
        return next;
      });
      return;
    }
    setRevealingId(id);
    try {
      const { data } = await AdminService.revealPayoutAccount(id);
      setRevealed((r) => ({ ...r, [id]: data }));
    } finally {
      setRevealingId(null);
    }
  }

  async function toggleVerified(row: AdminPayoutAccountRow) {
    const prev = rows;
    setRows((rs) => rs.map((r) => (r._id === row._id ? { ...r, verified: !r.verified } : r)));
    try {
      await AdminService.setPayoutVerified(row._id, !row.verified);
    } catch {
      setRows(prev);
    }
  }

  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch("/api/admin/payout-accounts/export", { credentials: "include" });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `payout-accounts-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Couldn't export payout accounts.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold text-ink">Payouts</h1>
        <button onClick={handleExport} disabled={exporting} className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 font-sans text-sm font-semibold text-accent-ink disabled:opacity-50">
          {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
          Export CSV
        </button>
      </div>

      {/* ── Payout requests (creators asking to be paid) ─────────────── */}
      <section className="mt-6">
        <h2 className="font-display text-lg font-semibold text-ink">Requests</h2>
        <p className="mt-1 font-sans text-sm text-ink-muted">
          Approve, reject, or mark payout requests as paid once you&apos;ve sent the money.
        </p>
        <div className="mt-3">
          <PayoutRequestsTable />
        </div>
      </section>

      {/* ── Payout accounts on file (bank/crypto details) ────────────── */}
      <section className="mt-10">
        <h2 className="font-display text-lg font-semibold text-ink">Accounts on file</h2>
        <p className="mt-1 max-w-2xl font-sans text-sm text-ink-muted">
          Numbers are encrypted at rest and only decrypted here, per row, on demand. Treat exported CSVs as sensitive.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <DropdownSelect
            value={method}
            options={METHOD_OPTIONS}
            onChange={setMethod}
            className="w-40"
          />
          <form onSubmit={(e) => { e.preventDefault(); load(1); }}>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by username…" className="w-56 rounded-lg border border-hairline px-3 py-1.5 font-sans text-sm" />
          </form>
        </div>

        <div className="mt-4 overflow-x-auto rounded-xl border border-hairline">
          <table className="w-full text-left font-sans text-sm">
            <thead className="border-b border-hairline text-xs uppercase text-ink-muted">
              <tr>
                <th className="px-4 py-2.5">Creator</th>
                <th className="px-4 py-2.5">Method</th>
                <th className="px-4 py-2.5">Details</th>
                <th className="px-4 py-2.5">Verified</th>
                <th className="px-4 py-2.5">Updated</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const rev = revealed[r._id];
                return (
                  <tr key={r._id} className="border-b border-hairline align-top last:border-0">
                    <td className="px-4 py-2.5">
                      <p className="font-medium text-ink">{r.user.displayName || r.user.username}</p>
                      <p className="text-xs text-ink-muted">@{r.user.username}</p>
                    </td>
                    <td className="px-4 py-2.5 text-ink-muted">{r.method}</td>
                    <td className="px-4 py-2.5">
                      {r.method === "bank" ? (
                        <>
                          <p className="text-ink">{r.bankName}</p>
                          <p className="text-xs text-ink-muted">{r.accountName}</p>
                          <p className="mt-0.5 font-mono text-xs text-ink">{rev ? rev.accountNumber : r.accountNumberMasked}</p>
                        </>
                      ) : (
                        <>
                          <p className="text-ink">{r.cryptoNetwork}</p>
                          <p className="mt-0.5 break-all font-mono text-xs text-ink">{rev ? rev.walletAddress : r.walletAddressMasked}</p>
                        </>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <button onClick={() => toggleVerified(r)} className={`flex items-center gap-1 rounded-full border px-2 py-1 text-xs ${r.verified ? "border-accent bg-accent/10 text-accent" : "border-hairline text-ink-muted"}`}>
                        <CheckCircle2 size={12} /> {r.verified ? "Verified" : "Mark verified"}
                      </button>
                    </td>
                    <td className="px-4 py-2.5 text-ink-muted">{new Date(r.updatedAt).toLocaleDateString()}</td>
                    <td className="px-4 py-2.5">
                      <button onClick={() => toggleReveal(r._id)} disabled={revealingId === r._id} className="text-ink-muted hover:text-ink" aria-label={rev ? "Hide details" : "Reveal details"}>
                        {revealingId === r._id ? <Loader2 size={15} className="animate-spin" /> : rev ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {loading && <p className="mt-4 font-sans text-sm text-ink-muted">Loading…</p>}

        <div className="mt-4 flex gap-2">
          {page > 1 && <button onClick={() => load(page - 1)} className="font-sans text-sm text-accent hover:underline">Previous</button>}
          {hasMore && <button onClick={() => load(page + 1)} className="font-sans text-sm text-accent hover:underline">Next</button>}
        </div>
      </section>
    </div>
  );
}