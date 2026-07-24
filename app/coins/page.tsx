"use client";
import { CoinService, type CoinActivityItem } from "@/app/services/coinService";
import { useRouter } from "nextjs-toploader/app";
import { useEffect, useState, useCallback } from "react";
import {
  Coins, ShieldCheck, ArrowUpRight, ArrowDownRight, ArrowLeft, Loader2, Smartphone,
} from "lucide-react";
import { COIN_PACKAGES, totalCoins, bonusPercent } from "@/lib/coin-packages";

const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.tipatale.app";

const STATUS_STYLES: Record<CoinActivityItem["status"], { label: string; badge: string; amount: string }> = {
  completed: { label: "", badge: "", amount: "" },
  pending: { label: "Pending", badge: "bg-amber-500/10 text-amber-600", amount: "text-amber-600" },
  failed: { label: "Failed", badge: "bg-red-500/10 text-red-600", amount: "text-ink-muted line-through" },
  reversed: { label: "Reversed", badge: "bg-slate-500/10 text-slate-500", amount: "text-ink-muted line-through" },
};

function getStatusStyle(status: CoinActivityItem["status"]) {
  return STATUS_STYLES[status] ?? STATUS_STYLES.completed;
}

export default function CoinsPage() {
  const router = useRouter();

  const [activity, setActivity] = useState<CoinActivityItem[] | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadWallet = useCallback(async () => {
    try {
      const [balRes, actRes] = await Promise.all([
        CoinService.getBalance(),
        CoinService.getTransactions(),
      ]);
      setBalance(balRes.data.coinBalance);
      setActivity(actRes.data.filter((item) => item.status !== "pending"));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setLoadError(err?.message ?? "Sign in to see your balance.");
    }
  }, []);

  useEffect(() => {
    loadWallet();
  }, [loadWallet]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <button onClick={() => router.back()} className="mb-5 flex items-center gap-1.5 font-sans text-sm font-medium text-ink-muted hover:text-ink">
        <ArrowLeft size={15} /> Back
      </button>

      <div className="mb-8">
        <p className="font-sans text-xs font-medium uppercase tracking-wide text-accent">Wallet</p>
        <h1 className="mt-0.5 font-display text-3xl font-bold text-ink">Your coins</h1>
        <p className="mt-1.5 max-w-md font-sans text-sm text-ink-muted">
          Coins unlock paid chapters and let you tip the authors you love.
        </p>
      </div>

      {/* Balance */}
      <div className="mb-8 flex items-center gap-4 rounded-2xl border border-hairline bg-surface-raised px-6 py-5 shadow-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/15 text-gold">
          <Coins size={26} />
        </div>
        <div>
          <p className="font-sans text-xs font-medium uppercase tracking-wide text-ink-muted">Your balance</p>
          {balance === null && !loadError && (
            <p className="flex items-center gap-2 font-display text-xl font-semibold text-ink-muted">
              <Loader2 size={16} className="animate-spin" /> Loading…
            </p>
          )}
          {loadError && <p className="font-sans text-sm text-ink-muted">{loadError}</p>}
          {balance !== null && (
            <p className="font-display text-3xl font-bold text-ink">
              {balance.toLocaleString()} <span className="text-base font-medium text-ink-muted">coins</span>
            </p>
          )}
        </div>
      </div>

      {/* Buy in app CTA */}
      <section className="mb-10 flex flex-col items-center gap-4 rounded-2xl border border-hairline bg-surface-raised p-8 text-center shadow-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent">
          <Smartphone size={26} />
        </div>
        <div>
          <h2 className="font-display text-xl font-semibold text-ink">Buy coins in the app</h2>
          <p className="mx-auto mt-1.5 max-w-sm font-sans text-sm text-ink-muted">
            Coin purchases happen through the Tipatale app, where you&apos;ll see pricing in your
            local currency and pay securely through Google Play.
          </p>
        </div>
        <a
          href={PLAY_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-sans text-sm font-semibold text-accent-ink shadow-sm hover:opacity-90"
        >
          <Coins size={16} /> Get the app to buy coins
        </a>
        <p className="flex items-center gap-1.5 font-sans text-xs text-ink-muted">
          <ShieldCheck size={13} /> Secure checkout via Google Play
        </p>
      </section>

      {/* Available packages (informational only — no prices, since those are
          shown in your local currency inside the app via Google Play) */}
      <section className="mb-10">
        <h2 className="mb-4 font-display text-xl font-semibold text-ink">Coin packages</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {COIN_PACKAGES.map((pkg, i) => (
            <PackagePreviewCard key={pkg.id} pkg={pkg} index={i} isBestValue={pkg.popular ?? false} />
          ))}
        </div>
        <p className="mt-3 font-sans text-xs text-ink-muted">
          Prices vary by region and are shown in your local currency inside the app.
        </p>
      </section>

      {/* Activity */}
      <section id="history">
        <h2 className="mb-4 font-display text-xl font-semibold text-ink">Recent activity</h2>
        <div className="overflow-hidden rounded-xl border border-hairline bg-surface-raised">
          {activity === null && (
            <p className="flex items-center gap-2 px-4 py-6 font-sans text-sm text-ink-muted">
              <Loader2 size={14} className="animate-spin" /> Loading activity…
            </p>
          )}
          {activity?.length === 0 && <p className="px-4 py-6 font-sans text-sm text-ink-muted">No activity yet.</p>}
          {activity?.map((item, i) => {
            const isCredit = item.coins > 0;
            const statusStyle = getStatusStyle(item.status);
            const isVoided = item.status === "failed" || item.status === "reversed";

            return (
              <div
                key={item.id}
                className={`flex items-center justify-between gap-4 px-4 py-3 ${
                  i !== activity.length - 1 ? "border-b border-hairline" : ""
                } ${isVoided ? "opacity-60" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      isVoided
                        ? "bg-ink-muted/10 text-ink-muted"
                        : isCredit
                        ? "bg-emerald-500/10 text-emerald-600"
                        : "bg-ink-muted/10 text-ink-muted"
                    }`}
                  >
                    {isCredit ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-sans text-sm text-ink">{item.label}</p>
                      {statusStyle.label && (
                        <span className={`rounded-full px-1.5 py-0.5 font-sans text-[10px] font-medium ${statusStyle.badge}`}>
                          {statusStyle.label}
                        </span>
                      )}
                    </div>
                    <p className="font-sans text-xs text-ink-muted">{item.date}</p>
                  </div>
                </div>
                <p
                  className={`font-mono text-sm font-semibold ${
                    statusStyle.amount || (isCredit ? "text-emerald-600" : "text-ink-muted")
                  }`}
                >
                  {isCredit ? "+" : ""}
                  {item.coins.toLocaleString()}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}

function PackagePreviewCard({
  pkg, index, isBestValue,
}: {
  pkg: (typeof COIN_PACKAGES)[number]; index: number; isBestValue: boolean;
}) {
  const bonus = bonusPercent(pkg);
  const coinIconSize = 16 + index * 3;

  return (
    <div className="relative flex flex-col items-center gap-2.5 rounded-xl border border-hairline bg-surface-raised p-4 text-center">
      {(isBestValue || pkg.popular) && (
        <span className={`absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-wide ${isBestValue ? "bg-gold text-ink" : "bg-accent text-accent-ink"}`}>
          {isBestValue ? "Best value" : "Most popular"}
        </span>
      )}
      <Coins size={coinIconSize} className="mt-1 text-gold" />
      <p className="font-display text-lg font-bold text-ink">{totalCoins(pkg).toLocaleString()}</p>
      {bonus > 0 && <p className="font-sans text-[11px] font-semibold text-emerald-600">+{bonus}% bonus</p>}
    </div>
  );
}