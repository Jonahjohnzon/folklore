import type { PaystackCurrency } from "./coin-packages";

const LOCALE_BY_CURRENCY: Record<PaystackCurrency, string> = {
  NGN: "en-NG",
  GHS: "en-GH",
  ZAR: "en-ZA",
  KES: "en-KE",
  USD: "en-US",
};

const SYMBOL: Record<PaystackCurrency, string> = {
  NGN: "₦",
  GHS: "GH₵",
  ZAR: "R",
  KES: "KSh",
  USD: "$",
};

export function formatMoney(amount: number, currency: PaystackCurrency): string {
  try {
    return new Intl.NumberFormat(LOCALE_BY_CURRENCY[currency], {
      style: "currency",
      currency,
    }).format(amount);
  } catch {
    return `${SYMBOL[currency]}${amount.toFixed(2)}`;
  }
}

export function formatPerCoin(amount: number, currency: PaystackCurrency): string {
  // Per-coin cost is a small fraction of a unit, so show more precision than a normal price.
  const decimals = currency === "USD" ? 4 : 3;
  return `${SYMBOL[currency]}${amount.toFixed(decimals)}`;
}