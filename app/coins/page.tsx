"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  Coins, Globe, ChevronDown, Check, Sparkles, ShieldCheck, Gift, Users,
  PlayCircle, CalendarCheck, CreditCard, Smartphone, Wallet, Landmark,
  ArrowUpRight, ArrowDownRight, Star, Info, ArrowLeft,
} from "lucide-react";
import { coinBalance } from "@/lib/mock-data";
import {
  CURRENCIES, detectCurrencyCode, formatPrice, convertFromUsd,
} from "@/lib/currency";
import {
  COIN_PACKAGES, totalCoins, bonusPercent, costPerCoin, bestValuePackageId,
  type CoinPackage,
} from "@/lib/coin-packages";

// ---- Payment methods -------------------------------------------------

interface PaymentMethod {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
}

const PAYMENT_CATALOG: Record<string, PaymentMethod> = {
  card: { id: "card", label: "Debit / credit card", icon: CreditCard },
  apple_pay: { id: "apple_pay", label: "Apple Pay", icon: Smartphone },
  google_pay: { id: "google_pay", label: "Google Pay", icon: Smartphone },
  paypal: { id: "paypal", label: "PayPal", icon: Wallet },
  mobile_money: { id: "mobile_money", label: "Mobile money", icon: Smartphone },
  bank_transfer: { id: "bank_transfer", label: "Bank transfer", icon: Landmark },
  upi: { id: "upi", label: "UPI", icon: Smartphone },
};

// Which methods actually make sense to surface for a given currency —
// showing Apple Pay to someone paying in Naira and hiding mobile money
// (the method most Nigerian readers will actually reach for) is exactly
// the kind of gap that makes payment screens feel imported, not local.
const METHODS_BY_CURRENCY: Record<string, string[]> = {
  NGN: ["card", "mobile_money", "bank_transfer"],
  KES: ["card", "mobile_money", "bank_transfer"],
  GHS: ["card", "mobile_money", "bank_transfer"],
  ZAR: ["card", "mobile_money", "bank_transfer"],
  INR: ["card", "upi", "paypal"],
  USD: ["card", "apple_pay", "google_pay", "paypal"],
  CAD: ["card", "apple_pay", "google_pay", "paypal"],
  AUD: ["card", "apple_pay", "google_pay", "paypal"],
  GBP: ["card", "apple_pay", "google_pay", "paypal"],
  EUR: ["card", "apple_pay", "google_pay", "paypal"],
};
const DEFAULT_METHODS = ["card", "paypal"];

// ---- Free-coin tasks (the part Wattpad doesn't have) ------------------

const FREE_COIN_TASKS = [
  { id: "checkin", label: "Daily check-in", detail: "Open Lore once a day", reward: 5, icon: CalendarCheck },
  { id: "watch", label: "Watch a short video", detail: "Up to 3 per day", reward: 15, icon: PlayCircle },
  { id: "refer", label: "Refer a friend", detail: "When they finish their first chapter", reward: 200, icon: Users },
  { id: "review", label: "Rate Lore", detail: "One-time bonus", reward: 50, icon: Star },
];

// ---- Mock recent activity ---------------------------------------------

const RECENT_ACTIVITY = [
  { id: "1", label: "Unlocked Chapter 12 — Veil of Ash", coins: -20, date: "Today" },
  { id: "2", label: "Daily check-in bonus", coins: 5, date: "Today" },
  { id: "3", label: "Purchased 1,200 coins", coins: 1200, date: "Yesterday" },
  { id: "4", label: "Tipped author S.K. Idowu", coins: -50, date: "2 days ago" },
];

// No real "change" events to subscribe to here — navigator.language is read
// once per render. useSyncExternalStore is still the right tool over a
// useEffect+setState pair: it lets us return a stable "USD" during SSR and
// the real detected value on the client in the same render pass, with no
// extra render cycle and no hydration-mismatch warning.
function subscribeToLocale() {
  return () => {};
}
function getServerLocaleSnapshot() {
  return "USD";
}

export default function CoinsPage() {
  const router = useRouter();
  const detectedCurrencyCode = useSyncExternalStore(
    subscribeToLocale,
    detectCurrencyCode,
    getServerLocaleSnapshot
  );
  const [manualCurrencyCode, setManualCurrencyCode] = useState<string | null>(null);
  const currencyCode = manualCurrencyCode ?? detectedCurrencyCode;
  const autoDetected = manualCurrencyCode === null;

  const [selectedPackageId, setSelectedPackageId] = useState(COIN_PACKAGES[1].id);
  const [pickedMethodId, setPickedMethodId] = useState<string | null>(null);

  // Computed, not effect-synced: only call bestValuePackageId() (cheap, 6
  // items, no deps) at render time rather than caching it across renders.
  const bestValueId = bestValuePackageId();
  const currency = CURRENCIES[currencyCode] ?? CURRENCIES.USD;
  const methodIds = METHODS_BY_CURRENCY[currencyCode] ?? DEFAULT_METHODS;

  // Derived at render time: use the user's explicit pick if it's still valid
  // for the current currency, otherwise fall back to the first method for
  // that currency. Avoids an effect just to keep these two in sync.
  const selectedMethodId = pickedMethodId && methodIds.includes(pickedMethodId)
    ? pickedMethodId
    : methodIds[0] ?? null;

  const selectedPackage = COIN_PACKAGES.find((p) => p.id === selectedPackageId)!;
  const maxCostPerCoin = Math.max(...COIN_PACKAGES.map(costPerCoin));

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <button
        onClick={() => router.back()}
        className="mb-5 flex items-center cursor-pointer gap-1.5 font-sans text-sm font-medium text-ink-muted transition hover:text-ink"
      >
        <ArrowLeft size={15} />
        Back
      </button>

      {/* Header */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-sans text-xs font-medium uppercase tracking-wide text-accent">Wallet</p>
          <h1 className="mt-0.5 font-display text-3xl font-bold text-ink">Buy coins</h1>
          <p className="mt-1.5 max-w-md font-sans text-sm text-ink-muted">
            {"Unlock paid chapters, tip the authors you love, and support new stories as they're written."}
          </p>
        </div>
        <CurrencySwitcher
          currencyCode={currencyCode}
          autoDetected={autoDetected}
          onChange={(code) => setManualCurrencyCode(code)}
        />
      </div>

      {/* Balance hero */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-6 rounded-2xl border border-hairline bg-surface-raised px-6 py-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/15 text-gold">
            <Coins size={26} />
          </div>
          <div>
            <p className="font-sans text-xs font-medium uppercase tracking-wide text-ink-muted">Your balance</p>
            <p className="font-display text-3xl font-bold text-ink">{coinBalance.toLocaleString()} <span className="text-base font-medium text-ink-muted">coins</span></p>
            <p className="font-sans text-xs text-ink-muted">
              ≈ worth about {formatApproxValue(coinBalance, currencyCode)}
            </p>
          </div>
        </div>
        <a
          href="#history"
          className="font-sans text-sm font-medium text-accent hover:underline"
        >
          View full history →
        </a>
      </div>

      {/* Package grid */}
      <section className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-ink">Choose a pack</h2>
          <p className="flex items-center gap-1.5 font-sans text-xs text-ink-muted">
            <Info size={13} /> Bars show value — longer means more coins per {currency.code}.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {COIN_PACKAGES.map((pkg, i) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              index={i}
              currencyCode={currencyCode}
              isBestValue={pkg.id === bestValueId}
              isSelected={pkg.id === selectedPackageId}
              maxCostPerCoin={maxCostPerCoin}
              onSelect={() => setSelectedPackageId(pkg.id)}
            />
          ))}
        </div>
      </section>

      {/* Checkout strip */}
      <section className="mb-10 rounded-2xl border border-hairline bg-surface-raised p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-sans text-xs font-medium uppercase tracking-wide text-ink-muted">Pay with</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {methodIds.map((id) => {
                const method = PAYMENT_CATALOG[id];
                if (!method) return null;
                const active = method.id === selectedMethodId;
                return (
                  <button
                    key={method.id}
                    onClick={() => setPickedMethodId(method.id)}
                    className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-sans text-xs font-medium transition ${
                      active
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-hairline text-ink-muted hover:border-accent/50 hover:text-ink"
                    }`}
                  >
                    <method.icon size={13} />
                    {method.label}
                  </button>
                );
              })}
            </div>
          </div>

          <button className="flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-sans text-sm font-semibold text-accent-ink shadow-sm transition hover:opacity-90 hover:shadow-md">
            <Coins size={16} />
            Buy {totalCoins(selectedPackage).toLocaleString()} coins — {formatPrice(selectedPackage.usdPrice, currencyCode)}
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-hairline pt-4 font-sans text-xs text-ink-muted">
          <span className="flex items-center gap-1.5"><ShieldCheck size={13} /> Secure checkout</span>
          <span className="flex items-center gap-1.5"><Coins size={13} /> Coins never expire</span>
          <span className="flex items-center gap-1.5"><Info size={13} /> Prices shown in {currency.label} ({currency.code})</span>
        </div>
      </section>

      {/* Earn free coins */}
      <section className="mb-10">
        <div className="mb-4 flex items-center gap-2">
          <Gift size={18} className="text-accent" />
          <h2 className="font-display text-xl font-semibold text-ink">Earn coins for free</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {FREE_COIN_TASKS.map((task) => (
            <div key={task.id} className="flex flex-col gap-3 rounded-xl border border-hairline bg-surface-raised p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/10 text-accent">
                <task.icon size={16} />
              </div>
              <div>
                <p className="font-sans text-sm font-semibold text-ink">{task.label}</p>
                <p className="font-sans text-xs text-ink-muted">{task.detail}</p>
              </div>
              <button className="mt-auto flex items-center justify-center gap-1.5 rounded-full border border-hairline py-2 font-sans text-xs font-semibold text-ink transition hover:border-accent hover:text-accent">
                <Sparkles size={12} /> +{task.reward} coins
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Recent activity */}
      <section id="history">
        <h2 className="mb-4 font-display text-xl font-semibold text-ink">Recent activity</h2>
        <div className="overflow-hidden rounded-xl border border-hairline bg-surface-raised">
          {RECENT_ACTIVITY.map((item, i) => (
            <div
              key={item.id}
              className={`flex items-center justify-between gap-4 px-4 py-3 ${i !== RECENT_ACTIVITY.length - 1 ? "border-b border-hairline" : ""}`}
            >
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

// ---- Subcomponents ------------------------------------------------------

function PackageCard({
  pkg, index, currencyCode, isBestValue, isSelected, maxCostPerCoin, onSelect,
}: {
  pkg: CoinPackage;
  index: number;
  currencyCode: string;
  isBestValue: boolean;
  isSelected: boolean;
  maxCostPerCoin: number;
  onSelect: () => void;
}) {
  const bonus = bonusPercent(pkg);
  const cpc = costPerCoin(pkg);
  // Cheapest cost-per-coin = fullest bar. Inverted + normalized against the
  // most expensive pack so the bar is a true relative value meter, not decoration.
  const barPercent = Math.max(8, 100 - (cpc / maxCostPerCoin) * 100);
  const coinIconSize = 16 + index * 3;

  return (
    <button
      onClick={onSelect}
      className={`relative flex flex-col items-center gap-2.5 rounded-xl border p-4 text-center transition ${
        isSelected ? "border-accent bg-accent/5 shadow-sm" : "border-hairline bg-surface-raised hover:border-accent/40"
      }`}
    >
      {(isBestValue || pkg.popular) && (
        <span
          className={`absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-wide ${
            isBestValue ? "bg-gold text-ink" : "bg-accent text-accent-ink"
          }`}
        >
          {isBestValue ? "Best value" : "Most popular"}
        </span>
      )}

      <Coins size={coinIconSize} className="mt-1 text-gold" />

      <p className="font-display text-lg font-bold text-ink">{totalCoins(pkg).toLocaleString()}</p>
      {bonus > 0 && (
        <p className="font-sans text-[11px] font-semibold text-emerald-600">+{bonus}% bonus</p>
      )}

      <p className="font-sans text-sm font-semibold text-ink">{formatPrice(pkg.usdPrice, currencyCode)}</p>

      {/* Value meter — the signature element: makes the otherwise-hidden cost-per-coin visible */}
      <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-hairline">
        <div className="h-full rounded-full bg-gold" style={{ width: `${barPercent}%` }} />
      </div>
      <p className="font-mono text-[10px] text-ink-muted">{formatPricePerCoin(cpc, currencyCode)}/coin</p>

      {isSelected && (
        <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-accent-ink">
          <Check size={12} />
        </span>
      )}
    </button>
  );
}

function CurrencySwitcher({
  currencyCode, autoDetected, onChange,
}: {
  currencyCode: string;
  autoDetected: boolean;
  onChange: (code: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const currency = CURRENCIES[currencyCode] ?? CURRENCIES.USD;

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full border border-hairline bg-surface-raised px-3.5 py-2 font-sans text-sm font-medium text-ink transition hover:border-accent"
      >
        <Globe size={14} className="text-ink-muted" />
        {currency.code}
        <span className="text-ink-muted">{currency.symbol}</span>
        <ChevronDown size={14} className="text-ink-muted" />
      </button>

      {autoDetected && (
        <p className="absolute right-0 top-full mt-1 whitespace-nowrap font-sans text-[11px] text-ink-muted">
          Detected from your device — not right?
        </p>
      )}

      {open && (
        <div className="absolute right-0 z-50 mt-2 max-h-80 w-56 overflow-y-auto rounded-xl border border-hairline bg-surface-raised p-1.5 shadow-xl">
          {Object.values(CURRENCIES).map((c) => (
            <button
              key={c.code}
              onClick={() => { onChange(c.code); setOpen(false); }}
              className={`flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 font-sans text-sm transition ${
                c.code === currencyCode ? "bg-accent/10 text-accent" : "text-ink hover:bg-bg"
              }`}
            >
              <span>{c.label}</span>
              <span className="text-ink-muted">{c.symbol} {c.code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- Small formatting helpers --------------------------------------------

// Coins are priced at roughly $0.01933/coin at the "popular" tier — used only
// to give the balance hero a rough real-world value estimate. Swap this for
// your actual blended/average coin rate once that's defined server-side.
function costPerCoinToUsdRatio() {
  return 51.7; // ≈ coins per USD cent at the reference tier
}

function formatApproxValue(coins: number, currencyCode: string): string {
  const usd = coins / costPerCoinToUsdRatio();
  return formatPrice(usd, currencyCode);
}

function formatPricePerCoin(centsPerCoin: number, currencyCode: string): string {
  const usd = centsPerCoin / 100;
  const converted = convertFromUsd(usd, currencyCode);
  const currency = CURRENCIES[currencyCode] ?? CURRENCIES.USD;
  // Per-coin cost is tiny — show enough decimal precision to be meaningful
  // even in currencies (like NGN) where one unit converts to a small number.
  return `${currency.symbol}${converted.toFixed(3)}`;
}