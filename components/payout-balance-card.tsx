/* eslint-disable @typescript-eslint/no-explicit-any */
// components/payout-balance-card.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Wallet, ChevronRight, Loader2, X } from "lucide-react";
import { PayoutService, type PayoutBalance, type PayoutRequestRow } from "@/app/services/PayoutService";
import { formatCompactNumber } from "@/lib/format";

export function PayoutBalanceCard() {
  const [balance, setBalance] = useState<PayoutBalance | null>(null);
  const [requests, setRequests] = useState<PayoutRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function load() {
    PayoutService.getRequests()
      .then(({ data }) => {
        setBalance(data.balance);
        setRequests(data.requests);
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!balance) return;

    // Floor, never round up — protects against fractional/overpay input.
    const amt = Math.floor(Number(amount));
    if (!Number.isFinite(amt) || amt <= 0) {
      setError("Enter a valid whole number of coins.");
      return;
    }
    if (amt < balance.minPayout) {
      setError(`Minimum payout is ${formatCompactNumber(balance.minPayout)} coins.`);
      return;
    }
    if (amt > balance.available) {
      setError(`You only have ${formatCompactNumber(balance.available)} coins available.`);
      return;
    }
    setSubmitting(true);
    try {
      await PayoutService.requestPayout(amt);
      setModalOpen(false);
      setAmount("");
      load();
    } catch (err: any) {
      setError(err.message || "Couldn't submit that request.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancel(id: string) {
    if (!confirm("Cancel this payout request?")) return;
    setCancellingId(id);
    try {
      await PayoutService.cancelRequest(id);
      load();
    } catch (err: any) {
      setError(err.message || "Couldn't cancel that request.");
    } finally {
      setCancellingId(null);
    }
  }

  const pendingRequest = requests.find((r) => r.status === "pending" || r.status === "approved");

  return (
    <div className="rounded-2xl border border-hairline bg-surface p-5">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 font-display text-lg font-semibold text-ink">
          <Wallet size={15} className="text-accent" /> Payout balance
        </h2>
        <Link href="/settings/payout" className="text-ink-muted hover:text-accent" aria-label="Payout settings">
          <ChevronRight size={16} />
        </Link>
      </div>

      {loading ? (
        <div className="mt-3 flex items-center gap-2 font-sans text-sm text-ink-muted">
          <Loader2 size={14} className="animate-spin" /> Loading…
        </div>
      ) : (
        <>
          <p className="mt-3 font-display text-3xl font-bold text-ink">
            {formatCompactNumber(balance?.available ?? 0)}
            <span className="ml-1.5 font-sans text-sm font-normal text-ink-muted">coins available</span>
          </p>

          {pendingRequest && (
            <p className="mt-1.5 font-sans text-xs text-ink-muted">
              {formatCompactNumber(pendingRequest.amountCoins)} coins {pendingRequest.status} — submitted{" "}
              {new Date(pendingRequest.createdAt).toLocaleDateString()}
            </p>
          )}

          <button
            onClick={() => setModalOpen(true)}
            disabled={!balance || balance.available < balance.minPayout}
            className="mt-3 w-full rounded-full bg-accent py-2 font-sans text-sm font-semibold text-accent-ink transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Request payout
          </button>
          {balance && balance.available < balance.minPayout && (
            <p className="mt-1.5 font-sans text-xs text-ink-muted">
              Minimum payout is {formatCompactNumber(balance.minPayout)} coins.
            </p>
          )}

          {requests.length > 0 && (
            <ul className="mt-4 divide-y divide-hairline border-t border-hairline pt-2">
              {requests.slice(0, 4).map((r) => (
                <li key={r._id} className="flex items-center justify-between gap-2 py-2 font-sans text-xs">
                  <span className="text-ink-muted">{new Date(r.createdAt).toLocaleDateString()}</span>
                  <span className="text-ink">{formatCompactNumber(r.amountCoins)} coins</span>
                  <StatusPill status={r.status} />
                  {r.status === "pending" && (
                    <button
                      onClick={() => handleCancel(r._id)}
                      disabled={cancellingId === r._id}
                      aria-label="Cancel request"
                      className="text-ink-muted hover:text-red-600 disabled:opacity-50"
                    >
                      {cancellingId === r._id ? <Loader2 size={12} className="animate-spin" /> : <X size={12} />}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}

          {error && <p className="mt-2 font-sans text-xs text-red-600">{error}</p>}
        </>
      )}

      {modalOpen && balance && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-xl border border-hairline bg-surface p-5 shadow-xl">
            <h3 className="font-display text-lg font-semibold text-ink">Request payout</h3>
            <p className="mt-1 font-sans text-xs text-ink-muted">
              {formatCompactNumber(balance.available)} coins available · minimum {formatCompactNumber(balance.minPayout)}
            </p>
            <form onSubmit={handleRequest} className="mt-4 flex flex-col gap-3">
              <input
                type="number"
                step="1"
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min={balance.minPayout}
                max={balance.available}
                placeholder={`e.g. ${balance.available}`}
                required
                className="w-full rounded-lg border border-hairline px-3 py-2 font-sans text-sm"
              />
              <button
                type="button"
                onClick={() => setAmount(String(balance.available))}
                className="self-start font-sans text-xs text-accent hover:underline"
              >
                Request full balance
              </button>
              {error && <p className="font-sans text-xs text-red-600">{error}</p>}
              <div className="mt-1 flex gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 rounded-full border border-hairline py-2 font-sans text-sm font-medium text-ink"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-full bg-accent py-2 font-sans text-sm font-semibold text-accent-ink disabled:opacity-50"
                >
                  {submitting ? "Submitting…" : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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