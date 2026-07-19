"use client";
import { CoinService, type CoinActivityItem } from "@/app/services/coinService";
import { useSearchParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { useEffect, useState, useCallback, Suspense } from "react";
import {
  Coins, Check, ShieldCheck, CreditCard, Bitcoin, Landmark, Globe,
  ArrowUpRight, ArrowDownRight, Info, ArrowLeft, Loader2, Clock, MousePointerClick,
} from "lucide-react";
import {
  COIN_PACKAGES, totalCoins, bonusPercent, costPerCoin,
  bestValuePackageId, priceFor, SUPPORTED_CURRENCIES,
  type CoinPackage, type PaystackCurrency,
} from "@/lib/coin-packages";
import { formatMoney, formatPerCoin } from "@/lib/currency";
import {
  startCoinCheckout, startFlutterwaveCheckout, startCryptoCheckout,
  goToCheckout, CheckoutError,
} from "@/lib/services/coinCheckout";

type PaymentMethod = "paystack" | "flutterwave" | "crypto";

const PENDING_POLL_INTERVAL_MS = 4000;
const PENDING_POLL_MAX_ATTEMPTS = 20;

const DEFAULT_CURRENCIES = SUPPORTED_CURRENCIES.filter((c) => c.code === "NGN");

// Module scope — this is static config, not per-render state.
// Keyed off the *actual* type flowing through `activity`, so there's
// no mismatch between this and item.status.
const STATUS_STYLES: Record<CoinActivityItem["status"], { label: string; badge: string; amount: string }> = {
  completed: { label: "", badge: "", amount: "" }, // no badge needed for the default state
  pending: { label: "Pending", badge: "bg-amber-500/10 text-amber-600", amount: "text-amber-600" },
  failed: { label: "Failed", badge: "bg-red-500/10 text-red-600", amount: "text-ink-muted line-through" },
  reversed: { label: "Reversed", badge: "bg-slate-500/10 text-slate-500", amount: "text-ink-muted line-through" },
};

function getStatusStyle(status: CoinActivityItem["status"]) {
  return STATUS_STYLES[status] ?? STATUS_STYLES.completed;
}

export default function CoinsPage() {
  return (
    <Suspense fallback={<CoinsPageFallback />}>
      <CoinsPageContent />
    </Suspense>
  );
}

function CoinsPageFallback() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <p className="font-sans text-xs font-medium uppercase tracking-wide text-accent">Wallet</p>
        <h1 className="mt-0.5 font-display text-3xl font-bold text-ink">Buy coins</h1>
      </div>
      <div className="mb-8 flex items-center gap-4 rounded-2xl border border-hairline bg-surface-raised px-6 py-5 shadow-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/15 text-gold">
          <Coins size={26} />
        </div>
        <p className="flex items-center gap-2 font-display text-xl font-semibold text-ink-muted">
          <Loader2 size={16} className="animate-spin" /> Loading…
        </p>
      </div>
    </main>
  );
}

function CoinsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activity, setActivity] = useState<CoinActivityItem[] | null>(null);
  const [selectedPackageId, setSelectedPackageId] = useState(COIN_PACKAGES[1].id);
  const [method, setMethod] = useState<PaymentMethod>("flutterwave");
  const [currency, setCurrency] = useState<PaystackCurrency | null>(null);
  const [availableCurrencies, setAvailableCurrencies] = useState(DEFAULT_CURRENCIES);

  const [email, setEmail] = useState("");
  const [balance, setBalance] = useState<number | null>(null);

  const [loadError, setLoadError] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const [awaitingCryptoConfirmation, setAwaitingCryptoConfirmation] = useState(
    searchParams.get("status") === "pending"
  );

  const loadWallet = useCallback(async () => {
    try {
      const [balRes, actRes] = await Promise.all([
        CoinService.getBalance(),
        CoinService.getTransactions(),
      ]);
      setBalance(balRes.data.coinBalance);
      setActivity(actRes.data.filter((item) => item.status !== "pending"));
      return balRes.data.coinBalance;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setLoadError(err?.message ?? "Sign in to see your balance.");
      return null;
    }
  }, []);

  useEffect(() => {
    loadWallet();
  }, [loadWallet]);

  // Refetch whenever the payment method changes — Paystack and Flutterwave
  // don't necessarily support the same currency set.
  useEffect(() => {
    if (method === "crypto") {
      setCurrency(null);
      return; // crypto has no currency picker
    }

    let cancelled = false;

    fetch(`/api/coins/currencies?method=${method}`)
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        const currencies = json.success ? json.data?.currencies ?? [] : [];
        setAvailableCurrencies(currencies.length ? currencies : DEFAULT_CURRENCIES);

        // Only one option? Nothing to actually choose, so pick it automatically.
        // More than one? Require an explicit pick — unless the current selection
        // is still valid for this method, in which case keep it.
        setCurrency((prev) => {
          const list = currencies.length ? currencies : DEFAULT_CURRENCIES;
          if (list.length === 1) return list[0].code;
          if (prev && list.some((c: { code: PaystackCurrency }) => c.code === prev)) return prev;
          return null;
        });
      })
      .catch(() => {
        setAvailableCurrencies(DEFAULT_CURRENCIES);
        setCurrency(DEFAULT_CURRENCIES.length === 1 ? DEFAULT_CURRENCIES[0].code : null);
      });

    return () => {
      cancelled = true;
    };
  }, [method]);

  useEffect(() => {
    if (!awaitingCryptoConfirmation) return;

    let attempts = 0;
    const startingBalance = balance;

    const interval = setInterval(async () => {
      attempts += 1;
      const fresh = await loadWallet();

      const balanceChanged = startingBalance !== null && fresh !== null && fresh !== startingBalance;
      if (balanceChanged || attempts >= PENDING_POLL_MAX_ATTEMPTS) {
        setAwaitingCryptoConfirmation(false);
        clearInterval(interval);
        router.replace("/coins");
      }
    }, PENDING_POLL_INTERVAL_MS);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [awaitingCryptoConfirmation]);

  // True whenever this method has a real currency choice to make and the
  // person hasn't made it yet — gates the package grid, email, and buy button.
  const needsCurrencyChoice =
    (method === "paystack" || method === "flutterwave") &&
    availableCurrencies.length > 1 &&
    currency === null;

  const noCurrencyConfigured =
    (method === "paystack" || method === "flutterwave") && availableCurrencies.length === 0;

  const effectiveCurrency: PaystackCurrency = currency ?? "NGN";
  const bestValueId = bestValuePackageId(effectiveCurrency);
  const selectedPackage = COIN_PACKAGES.find((p) => p.id === selectedPackageId)!;
  const maxCostPerCoin = Math.max(...COIN_PACKAGES.map((p) => costPerCoin(p, effectiveCurrency)));
  const currencyMeta =
    SUPPORTED_CURRENCIES.find((c) => c.code === effectiveCurrency) ?? SUPPORTED_CURRENCIES[0];

  async function handleBuyClick() {
    setCheckoutError(null);
    if (!email.trim()) { setCheckoutError("Enter an email to receive your receipt."); return; }
    setIsCheckingOut(true);
    try {
      if (method === "paystack") {
        const { authorizationUrl } = await startCoinCheckout({
          packageId: selectedPackageId, email: email.trim(), currency: effectiveCurrency,
        });
        goToCheckout(authorizationUrl);
      } else if (method === "flutterwave") {
        const { authorizationUrl } = await startFlutterwaveCheckout({
          packageId: selectedPackageId, email: email.trim(), currency: effectiveCurrency,
        });
        goToCheckout(authorizationUrl);
      } else {
        const { paymentUrl } = await startCryptoCheckout({ packageId: selectedPackageId, email: email.trim() });
        goToCheckout(paymentUrl);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setCheckoutError(err instanceof CheckoutError ? err.message : "Something went wrong. Try again.");
      setIsCheckingOut(false);
    }
  }

  const price = method === "crypto"
    ? formatMoney(priceFor(selectedPackage, "USD"), "USD")
    : formatMoney(priceFor(selectedPackage, effectiveCurrency), effectiveCurrency);

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

      {awaitingCryptoConfirmation && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-gold/30 bg-gold/10 px-5 py-4">
          <Loader2 size={18} className="animate-spin text-gold" />
          <div>
            <p className="font-sans text-sm font-medium text-ink">Confirming your crypto payment…</p>
            <p className="font-sans text-xs text-ink-muted">
              This can take a minute or two depending on the network. Your coins will appear here automatically.
            </p>
          </div>
        </div>
      )}

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

      <section className="mb-6 rounded-2xl border border-hairline bg-surface-raised p-5 shadow-sm">
        <p className="mb-2 font-sans text-xs font-medium uppercase tracking-wide text-ink-muted">Pay with</p>
        <div className="flex flex-wrap gap-2">
          <MethodButton active={method === "flutterwave"} onClick={() => setMethod("flutterwave")} icon={CreditCard} label="Flutterwave" />
          <MethodButton active={method === "paystack"} onClick={() => setMethod("paystack")} icon={Globe} label="Paystack — Unavailable" disabled />
          <MethodButton
            active={false}
            disabled
            onClick={() => {}}
            icon={Bitcoin}
            label="Crypto — Coming soon"
          />
        </div>

        {(method === "paystack" || method === "flutterwave") && availableCurrencies.length > 1 && (
          <div className="mt-4 border-t border-hairline pt-4">
            <p className="mb-2 flex items-center gap-1.5 font-sans text-xs font-medium uppercase tracking-wide text-ink-muted">
              Currency {currency === null && <span className="normal-case text-accent">— choose one to continue</span>}
            </p>
            <div className="flex flex-wrap gap-2">
              {availableCurrencies.map((c) => (
                <button
                  key={c.code}
                  onClick={() => setCurrency(c.code)}
                  className={`rounded-full border px-3 py-1.5 font-sans text-xs font-medium transition ${
                    currency === c.code
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-hairline text-ink-muted hover:border-accent/50 hover:text-ink"
                  }`}
                >
                  {c.symbol} {c.code}
                </button>
              ))}
            </div>
          </div>
        )}

        {noCurrencyConfigured && (
          <p className="mt-3 font-sans text-xs text-ink-muted">
            This payment method isn&apos;t set up yet — try a different one.
          </p>
        )}

        {method === "crypto" && (
          <p className="mt-2.5 flex items-center gap-1.5 font-sans text-xs text-ink-muted">
            <Clock size={12} /> Crypto payments confirm on-chain — coins are credited a few minutes after payment.
          </p>
        )}
      </section>

      <section className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display sm:text-xl  font-semibold text-ink">Choose a pack</h2>
          <p className="hidden sm:flex items-center gap-1.5 font-sans text-xs text-ink-muted">
            <Info size={13} /> Bars show value — longer means more coins per {currencyMeta.symbol}.
          </p>
        </div>

        {needsCurrencyChoice ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-hairline bg-surface-raised px-6 py-10 text-center">
            <MousePointerClick size={22} className="text-ink-muted" />
            <p className="font-sans text-sm font-medium text-ink">Pick a currency above first</p>
            <p className="font-sans text-xs text-ink-muted">Prices depend on which currency you&apos;re paying in.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {COIN_PACKAGES.map((pkg, i) => (
              <PackageCard
                key={pkg.id}
                pkg={pkg}
                index={i}
                currency={effectiveCurrency}
                isBestValue={pkg.id === bestValueId}
                isSelected={pkg.id === selectedPackageId}
                maxCostPerCoin={maxCostPerCoin}
                onSelect={() => setSelectedPackageId(pkg.id)}
              />
            ))}
          </div>
        )}
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
              disabled={needsCurrencyChoice}
              className="w-56 rounded-lg border border-hairline bg-surface px-3 py-1.5 font-sans text-sm text-ink outline-none focus:border-accent disabled:cursor-not-allowed disabled:opacity-50"
            />
          </label>

          <div className="flex flex-col items-end gap-2">
            <button
              onClick={handleBuyClick}
              disabled={isCheckingOut || needsCurrencyChoice || noCurrencyConfigured}
              className="flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-sans text-sm font-semibold text-accent-ink shadow-sm hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Coins size={16} />
              {isCheckingOut
                ? "Redirecting to checkout…"
                : needsCurrencyChoice
                ? "Choose a currency to continue"
                : `Buy ${totalCoins(selectedPackage).toLocaleString()} coins — ${price}`}
            </button>
            {checkoutError && <p className="max-w-56 text-right font-sans text-xs text-red-600">{checkoutError}</p>}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-hairline pt-4 font-sans text-xs text-ink-muted">
          <span className="flex items-center gap-1.5"><ShieldCheck size={13} /> Secure checkout</span>
          <span className="flex items-center gap-1.5"><Coins size={13} /> Coins never expire</span>
          {!needsCurrencyChoice && (
            <span className="flex items-center gap-1.5"><Landmark size={13} /> Prices in {currencyMeta.label} ({currencyMeta.symbol})</span>
          )}
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

function MethodButton({
  active, onClick, icon: Icon, label, disabled,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-sans text-xs font-medium transition ${
        disabled
          ? "cursor-not-allowed border-hairline text-ink-muted/50 opacity-60"
          : active
          ? "border-accent bg-accent/10 text-accent"
          : "border-hairline text-ink-muted hover:border-accent/50 hover:text-ink"
      }`}
    >
      <Icon size={13} /> {label}
    </button>
  );
}

function PackageCard({
  pkg, index, currency, isBestValue, isSelected, maxCostPerCoin, onSelect,
}: {
  pkg: CoinPackage; index: number; currency: PaystackCurrency;
  isBestValue: boolean; isSelected: boolean; maxCostPerCoin: number; onSelect: () => void;
}) {
  const bonus = bonusPercent(pkg);
  const cpc = costPerCoin(pkg, currency);
  const barPercent = Math.max(8, 100 - (cpc / maxCostPerCoin) * 100);
  const coinIconSize = 16 + index * 3;
  const priceLabel = formatMoney(priceFor(pkg, currency), currency);
  const perCoinLabel = formatPerCoin(cpc, currency);

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