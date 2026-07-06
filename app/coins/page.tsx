"use client";
import { CoinService, type CoinActivityItem } from "@/app/services/coinService";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Coins, Check, ShieldCheck, CreditCard, Bitcoin, Landmark,
  ArrowUpRight, ArrowDownRight, Info, ArrowLeft, Loader2,
} from "lucide-react";
import { formatNaira, formatUsd, formatNairaPerCoin, formatUsdPerCoin } from "@/lib/currency";
import {
  COIN_PACKAGES, totalCoins, bonusPercent, costPerCoinNaira, costPerCoinUsd,
  bestValuePackageId, type CoinPackage,
} from "@/lib/coin-packages";
import { startCoinCheckout, startCryptoCheckout, goToCheckout, CheckoutError } from "@/lib/services/coinCheckout";

type PaymentMethod = "paystack" | "crypto";

export default function CoinsPage() {
  const router = useRouter();
  const [activity, setActivity] = useState<CoinActivityItem[] | null>(null);
  const [selectedPackageId, setSelectedPackageId] = useState(COIN_PACKAGES[1].id);
  const [method, setMethod] = useState<PaymentMethod>("paystack");
  const currency: "NGN" | "USD" = method === "paystack" ? "NGN" : "USD";

  const [email, setEmail] = useState("");
  const [balance, setBalance] = useState<number | null>(null);
  
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [balRes, actRes] = await Promise.all([
          CoinService.getBalance(),
          CoinService.getTransactions(),
        ]);
        if (cancelled) return;
        setBalance(balRes.data.coinBalance);
        setActivity(actRes.data);
      } catch (err: any) {
        if (!cancelled) setLoadError(err?.message ?? "Sign in to see your balance.");
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const bestValueId = bestValuePackageId(currency);
  const selectedPackage = COIN_PACKAGES.find((p) => p.id === selectedPackageId)!;
  const maxCostPerCoin = Math.max(
    ...COIN_PACKAGES.map((p) => (currency === "NGN" ? costPerCoinNaira(p) : costPerCoinUsd(p)))
  );

  async function handleBuyClick() {
    setCheckoutError(null);
    if (!email.trim()) { setCheckoutError("Enter an email to receive your receipt."); return; }
    setIsCheckingOut(true);
    try {
      if (method === "paystack") {
        const { authorizationUrl } = await startCoinCheckout({ packageId: selectedPackageId, email: email.trim() });
        goToCheckout(authorizationUrl);
      } else {
        const { paymentUrl } = await startCryptoCheckout({ packageId: selectedPackageId, email: email.trim() });
        goToCheckout(paymentUrl);
      }
    } catch (err: any) {
      setCheckoutError(err instanceof CheckoutError ? err.message : "Something went wrong. Try again.");
      setIsCheckingOut(false);
    }
  }

  const price = currency === "NGN" ? formatNaira(selectedPackage.nairaPrice) : formatUsd(selectedPackage.usdPrice);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <button onClick={() => router.back()} className="mb-5 flex items-center gap-1.5 font-sans text-sm font-medium text-ink-muted hover:text-ink">
        <ArrowLeft size={15} /> Back
      </button>

      <div className="mb-8">
        <p className="font-sans text-xs font-medium uppercase tracking-wide text-accent">Wallet</p>
        <h1 className="mt-0.5 font-display text-3xl font-bold text-ink">Buy coins</h1>
        <p className="mt-1.5 max-w-md font-sans text-sm text-ink-muted">
          {"Unlock paid chapters, tip the authors you love, and support new stories as they're written."}
        </p>
      </div>

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

      {/* Payment method chosen FIRST — it determines which currency the whole page prices in */}
      <section className="mb-6 rounded-2xl border border-hairline bg-surface-raised p-5 shadow-sm">
        <p className="mb-2 font-sans text-xs font-medium uppercase tracking-wide text-ink-muted">Pay with</p>
        <div className="flex flex-wrap gap-2">
          <MethodButton active={method === "paystack"} onClick={() => setMethod("paystack")} icon={CreditCard} label="Card / bank transfer / mobile money (₦)" />
          <MethodButton active={method === "crypto"} onClick={() => setMethod("crypto")} icon={Bitcoin} label="Crypto ($)" />
        </div>
      </section>

      <section className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-ink">Choose a pack</h2>
          <p className="flex items-center gap-1.5 font-sans text-xs text-ink-muted">
            <Info size={13} /> Bars show value — longer means more coins per {currency === "NGN" ? "₦" : "$"}.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {COIN_PACKAGES.map((pkg, i) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              index={i}
              currency={currency}
              isBestValue={pkg.id === bestValueId}
              isSelected={pkg.id === selectedPackageId}
              maxCostPerCoin={maxCostPerCoin}
              onSelect={() => setSelectedPackageId(pkg.id)}
            />
          ))}
        </div>
      </section>

      <section className="mb-10 rounded-2xl border border-hairline bg-surface-raised p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <label className="flex flex-col gap-1">
            <span className="font-sans text-xs font-medium uppercase tracking-wide text-ink-muted">Email for receipt</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-56 rounded-lg border border-hairline bg-surface px-3 py-1.5 font-sans text-sm text-ink outline-none focus:border-accent"
            />
          </label>

          <div className="flex flex-col items-end gap-2">
            <button
              onClick={handleBuyClick}
              disabled={isCheckingOut}
              className="flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-sans text-sm font-semibold text-accent-ink shadow-sm hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Coins size={16} />
              {isCheckingOut ? "Redirecting to checkout…" : `Buy ${totalCoins(selectedPackage).toLocaleString()} coins — ${price}`}
            </button>
            {checkoutError && <p className="max-w-56 text-right font-sans text-xs text-red-600">{checkoutError}</p>}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-hairline pt-4 font-sans text-xs text-ink-muted">
          <span className="flex items-center gap-1.5"><ShieldCheck size={13} /> Secure checkout</span>
          <span className="flex items-center gap-1.5"><Coins size={13} /> Coins never expire</span>
          <span className="flex items-center gap-1.5"><Landmark size={13} /> Prices in {currency === "NGN" ? "Naira (₦)" : "US Dollars ($)"}</span>
        </div>
      </section>

      <section id="history">
        <h2 className="mb-4 font-display text-xl font-semibold text-ink">Recent activity</h2>
        <div className="overflow-hidden rounded-xl border border-hairline bg-surface-raised">
          {activity === null && (
            <p className="flex items-center gap-2 px-4 py-6 font-sans text-sm text-ink-muted">
              <Loader2 size={14} className="animate-spin" /> Loading activity…
            </p>
          )}
          {activity?.length === 0 && <p className="px-4 py-6 font-sans text-sm text-ink-muted">No activity yet.</p>}
          {activity?.map((item, i) => (
            <div key={item.id} className={`flex items-center justify-between gap-4 px-4 py-3 ${i !== activity.length - 1 ? "border-b border-hairline" : ""}`}>
              <div className="flex items-center gap-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full ${item.coins > 0 ? "bg-emerald-500/10 text-emerald-600" : "bg-ink-muted/10 text-ink-muted"}`}>
                  {item.coins > 0 ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
                </div>
                <div>
                  <p className="font-sans text-sm text-ink">{item.label}</p>
                  <p className="font-sans text-xs text-ink-muted">{item.date}</p>
                </div>
              </div>
              <p className={`font-mono text-sm font-semibold ${item.coins > 0 ? "text-emerald-600" : "text-ink-muted"}`}>
                {item.coins > 0 ? "+" : ""}{item.coins.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function MethodButton({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: React.ComponentType<{ size?: number }>; label: string }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-sans text-xs font-medium transition ${active ? "border-accent bg-accent/10 text-accent" : "border-hairline text-ink-muted hover:border-accent/50 hover:text-ink"}`}>
      <Icon size={13} /> {label}
    </button>
  );
}

function PackageCard({
  pkg, index, currency, isBestValue, isSelected, maxCostPerCoin, onSelect,
}: {
  pkg: CoinPackage; index: number; currency: "NGN" | "USD";
  isBestValue: boolean; isSelected: boolean; maxCostPerCoin: number; onSelect: () => void;
}) {
  const bonus = bonusPercent(pkg);
  const cpc = currency === "NGN" ? costPerCoinNaira(pkg) : costPerCoinUsd(pkg);
  const barPercent = Math.max(8, 100 - (cpc / maxCostPerCoin) * 100);
  const coinIconSize = 16 + index * 3;
  const priceLabel = currency === "NGN" ? formatNaira(pkg.nairaPrice) : formatUsd(pkg.usdPrice);
  const perCoinLabel = currency === "NGN" ? formatNairaPerCoin(cpc) : formatUsdPerCoin(cpc);

  return (
    <button onClick={onSelect} className={`relative flex flex-col items-center gap-2.5 rounded-xl border p-4 text-center transition ${isSelected ? "border-accent bg-accent/5 shadow-sm" : "border-hairline bg-surface-raised hover:border-accent/40"}`}>
      {(isBestValue || pkg.popular) && (
        <span className={`absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-wide ${isBestValue ? "bg-gold text-ink" : "bg-accent text-accent-ink"}`}>
          {isBestValue ? "Best value" : "Most popular"}
        </span>
      )}
      <Coins size={coinIconSize} className="mt-1 text-gold" />
      <p className="font-display text-lg font-bold text-ink">{totalCoins(pkg).toLocaleString()}</p>
      {bonus > 0 && <p className="font-sans text-[11px] font-semibold text-emerald-600">+{bonus}% bonus</p>}
      <p className="font-sans text-sm font-semibold text-ink">{priceLabel}</p>
      <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-hairline">
        <div className="h-full rounded-full bg-gold" style={{ width: `${barPercent}%` }} />
      </div>
      <p className="font-mono text-[10px] text-ink-muted">{perCoinLabel}/coin</p>
      {isSelected && (
        <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-accent-ink">
          <Check size={12} />
        </span>
      )}
    </button>
  );
}