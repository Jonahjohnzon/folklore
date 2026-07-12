// app/settings/payout/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, Landmark, Wallet } from "lucide-react";
import { PayoutService, type PayoutAccountView } from "@/app/services/PayoutService";

const CRYPTO_NETWORKS = ["USDT-TRC20", "USDT-ERC20", "USDT-BEP20", "BTC", "ETH", "USDC-ERC20"];

export default function PayoutSettingsPage() {
  const [account, setAccount] = useState<PayoutAccountView | null>(null);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState<"bank" | "crypto">("bank");

  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [cryptoNetwork, setCryptoNetwork] = useState(CRYPTO_NETWORKS[0]);
  const [walletAddress, setWalletAddress] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    PayoutService.get()
      .then(({ data }) => {
        if (data.account) {
          setAccount(data.account);
          setMethod(data.account.method);
          if (data.account.method === "bank") {
            setBankName(data.account.bankName ?? "");
            setAccountName(data.account.accountName ?? "");
          } else {
            setCryptoNetwork(data.account.cryptoNetwork ?? CRYPTO_NETWORKS[0]);
          }
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      if (method === "bank") {
        if (!/^\d{10}$/.test(accountNumber)) throw new Error("Nigerian account numbers are 10 digits.");
        await PayoutService.save({ method: "bank", bankName: bankName.trim(), accountNumber: accountNumber.trim(), accountName: accountName.trim() });
      } else {
        if (walletAddress.trim().length < 20) throw new Error("That wallet address looks too short.");
        await PayoutService.save({ method: "crypto", cryptoNetwork, walletAddress: walletAddress.trim() });
      }
      setSaved(true);
      setAccountNumber("");
      setWalletAddress("");
      const { data } = await PayoutService.get();
      setAccount(data.account);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save your payout details.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-[40vh] items-center justify-center gap-2 text-ink-muted">
        <Loader2 size={18} className="animate-spin" /> Loading…
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-ink">Payout details</h1>
      <p className="mt-1.5 font-sans text-sm text-ink-muted">
        Where we send your coin earnings. Only visible to you and TipaTale admins processing payouts.
      </p>

      {account && (
        <div className="mt-5 rounded-xl border border-hairline bg-surface p-4">
          <p className="font-sans text-xs font-semibold uppercase tracking-wide text-ink-muted">Currently on file</p>
          {account.method === "bank" ? (
            <p className="mt-1 font-sans text-sm text-ink">{account.bankName} — {account.accountNumberMasked} ({account.accountName})</p>
          ) : (
            <p className="mt-1 font-sans text-sm text-ink">{account.cryptoNetwork} — {account.walletAddressMasked}</p>
          )}
          <p className="mt-1 flex items-center gap-1 font-sans text-xs">
            {account.verified ? (
              <span className="flex items-center gap-1 text-emerald-600"><CheckCircle2 size={12} /> Verified</span>
            ) : (
              <span className="text-ink-muted">Pending verification</span>
            )}
          </p>
        </div>
      )}

      <div className="mt-6 flex gap-2">
        <button onClick={() => setMethod("bank")} className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2.5 font-sans text-sm font-medium transition ${method === "bank" ? "border-accent bg-accent/10 text-accent" : "border-hairline text-ink-muted"}`}>
          <Landmark size={15} /> Nigerian bank
        </button>
        <button onClick={() => setMethod("crypto")} className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2.5 font-sans text-sm font-medium transition ${method === "crypto" ? "border-accent bg-accent/10 text-accent" : "border-hairline text-ink-muted"}`}>
          <Wallet size={15} /> Crypto wallet
        </button>
      </div>

      <form onSubmit={handleSave} className="mt-5 flex flex-col gap-3">
        {method === "bank" ? (
          <>
            <Field label="Bank name">
              <input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="e.g. GTBank, Access Bank, Kuda" required className="w-full rounded-lg border border-hairline px-3 py-2 font-sans text-sm" />
            </Field>
            <Field label="Account number">
              <input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="10-digit NUBAN" inputMode="numeric" required className="w-full rounded-lg border border-hairline px-3 py-2 font-sans text-sm" />
            </Field>
            <Field label="Account name">
              <input value={accountName} onChange={(e) => setAccountName(e.target.value)} placeholder="Name on the account" required className="w-full rounded-lg border border-hairline px-3 py-2 font-sans text-sm" />
            </Field>
          </>
        ) : (
          <>
            <Field label="Network">
              <select value={cryptoNetwork} onChange={(e) => setCryptoNetwork(e.target.value)} className="w-full rounded-lg border border-hairline px-3 py-2 font-sans text-sm">
                {CRYPTO_NETWORKS.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </Field>
            <Field label="Wallet address">
              <input value={walletAddress} onChange={(e) => setWalletAddress(e.target.value)} placeholder="Paste your wallet address" required className="w-full rounded-lg border border-hairline px-3 py-2 font-mono text-xs" />
            </Field>
          </>
        )}

        {error && <div className="rounded-lg border border-red-300 bg-red-50 px-3.5 py-2 font-sans text-sm text-red-700">{error}</div>}
        {saved && <div className="rounded-lg border border-emerald-300 bg-emerald-50 px-3.5 py-2 font-sans text-sm text-emerald-700">Saved. We&apos;ll verify it before your next payout.</div>}

        <button type="submit" disabled={saving} className="mt-1 rounded-full bg-accent py-2.5 font-sans text-sm font-semibold text-accent-ink disabled:opacity-50">
          {saving ? "Saving…" : "Save payout details"}
        </button>
      </form>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-sans text-xs font-medium text-ink-muted">{label}</span>
      {children}
    </label>
  );
}