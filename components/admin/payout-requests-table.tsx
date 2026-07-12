// components/admin/payout-requests-table.tsx
"use client";

import { useEffect, useState } from "react";
import { Check, X, Banknote } from "lucide-react";
import { AdminService, type AdminPayoutRequestRow } from "@/app/services/AdminService";
import { DropdownSelect } from "@/app/components/ui/dropdown-select";

const STATUS_OPTIONS = [
  { value: "pending" as const, label: "Pending" },
  { value: "approved" as const, label: "Approved" },
  { value: "paid" as const, label: "Paid" },
  { value: "rejected" as const, label: "Rejected" },
  { value: "cancelled" as const, label: "Cancelled" },
  { value: "all" as const, label: "All statuses" },
];

export function PayoutRequestsTable() {
  const [rows, setRows] = useState<AdminPayoutRequestRow[]>([]);
  const [status, setStatus] = useState<(typeof STATUS_OPTIONS)[number]["value"]>("pending");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  function load(p: number) {
    setLoading(true);
    AdminService.getPayoutRequests(p, status)
      .then((res) => {
        setRows(res.data.requests);
        setHasMore(res.data.hasMore);
        setPage(p);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  async function updateStatus(id: string, next: "approved" | "paid" | "rejected") {
    setBusyId(id);
    try {
      await AdminService.updatePayoutRequest(id, { status: next });
      load(page);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <DropdownSelect value={status} options={STATUS_OPTIONS} onChange={setStatus} className="w-44" />
      </div>

      <div className="overflow-x-auto rounded-xl border border-hairline">
        <table className="w-full text-left font-sans text-sm">
          <thead className="border-b border-hairline text-xs uppercase text-ink-muted">
            <tr>
              <th className="px-4 py-2.5">Creator</th>
              <th className="px-4 py-2.5">Amount</th>
              <th className="px-4 py-2.5">Destination</th>
              <th className="px-4 py-2.5">Requested</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r._id} className="border-b border-hairline align-top last:border-0">
                <td className="px-4 py-2.5">
                  <p className="font-medium text-ink">{r.user.displayName || r.user.username}</p>
                  <p className="text-xs text-ink-muted">@{r.user.username}</p>
                </td>
                {/* Exact amount, not abbreviated — an admin sending real money
                    needs to see 12,345 coins, not "12.3K". */}
                <td className="px-4 py-2.5 font-mono font-semibold text-ink">{r.amountCoins.toLocaleString()}</td>
                <td className="px-4 py-2.5 text-xs text-ink-muted">
                  {r.method === "bank"
                    ? `${r.destinationSnapshot.bankName} — ${r.destinationSnapshot.accountNumberMasked}`
                    : `${r.destinationSnapshot.cryptoNetwork} — ${r.destinationSnapshot.walletAddressMasked}`}
                </td>
                <td className="px-4 py-2.5 text-ink-muted">{new Date(r.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-2.5">
                  <StatusPill status={r.status} />
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex gap-1.5">
                    {r.status === "pending" && (
                      <>
                        <button
                          onClick={() => updateStatus(r._id, "approved")}
                          disabled={busyId === r._id}
                          className="flex items-center gap-1 rounded-full border border-hairline px-2.5 py-1 text-xs text-ink hover:border-accent hover:text-accent"
                        >
                          <Check size={12} /> Approve
                        </button>
                        <button
                          onClick={() => updateStatus(r._id, "rejected")}
                          disabled={busyId === r._id}
                          className="flex items-center gap-1 rounded-full border border-hairline px-2.5 py-1 text-xs text-ink hover:border-red-400 hover:text-red-600"
                        >
                          <X size={12} /> Reject
                        </button>
                      </>
                    )}
                    {r.status === "approved" && (
                      <button
                        onClick={() => updateStatus(r._id, "paid")}
                        disabled={busyId === r._id}
                        className="flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-ink"
                      >
                        <Banknote size={12} /> Mark paid
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center font-sans text-sm text-ink-muted">
                  No {status !== "all" ? status : ""} requests.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {loading && <p className="mt-3 font-sans text-sm text-ink-muted">Loading…</p>}

      <div className="mt-3 flex gap-2">
        {page > 1 && <button onClick={() => load(page - 1)} className="font-sans text-sm text-accent hover:underline">Previous</button>}
        {hasMore && <button onClick={() => load(page + 1)} className="font-sans text-sm text-accent hover:underline">Next</button>}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-hairline/40 text-ink-muted",
    approved: "bg-accent/10 text-accent",
    paid: "bg-emerald-100 text-emerald-700",
    rejected: "bg-red-100 text-red-700",
    cancelled: "bg-hairline/20 text-ink-muted/70",
  };
  return <span className={`rounded-full px-2 py-0.5 font-sans text-[10px] font-semibold capitalize ${styles[status] ?? ""}`}>{status}</span>;
}