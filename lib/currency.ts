// Currency handling for the coin store.
//
// IMPORTANT — read this before wiring up real payments:
// The `rate` values below are illustrative fixed conversion rates, not live FX.
// For a real store, get localized prices from your payment processor
// (Stripe Prices per currency, Paystack/Flutterwave for NGN, etc.) rather than
// computing them client-side — processors handle rounding, regional psychological
// price points (₦999 instead of ₦7,730.41), and tax-inclusive pricing correctly;
// a flat FX multiplier does not.
//
// Region detection here is also best-effort: `navigator.language` reflects the
// browser/OS locale setting, not the user's actual location. A device set to
// en-US while physically in Lagos will detect as US. For real IP-based
// geolocation, do this server-side — e.g. read `request.geo.country` in
// Next.js Middleware/Edge, or call an IP lookup API — and pass the result down
// as a cookie or server prop instead of relying on the client guess below.

export interface CurrencyInfo {
  code: string;
  symbol: string;
  /** Units of this currency per 1 USD (illustrative, not live) */
  rate: number;
  /** A locale Intl can format this currency correctly with */
  locale: string;
  label: string;
}

export const CURRENCIES: Record<string, CurrencyInfo> = {
  USD: { code: "USD", symbol: "$", rate: 1, locale: "en-US", label: "US Dollar" },
  NGN: { code: "NGN", symbol: "₦", rate: 1550, locale: "en-NG", label: "Nigerian Naira" },
  KES: { code: "KES", symbol: "KSh", rate: 129, locale: "en-KE", label: "Kenyan Shilling" },
  GHS: { code: "GHS", symbol: "GH₵", rate: 15.2, locale: "en-GH", label: "Ghanaian Cedi" },
};

// Maps a browser-locale "region" subtag to one of the currencies above.
// Anything not listed falls back to USD.
const REGION_TO_CURRENCY: Record<string, string> = {
  NG: "NGN",
  US: "USD",
  KE: "KES",
  GH: "GHS",
};

/** Best-effort currency guess from the browser's own locale string. */
export function detectCurrencyCode(): string {
  if (typeof navigator === "undefined") return "USD";
  const locales = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const loc of locales) {
    const region = loc.split("-")[1]?.toUpperCase();
    if (region && REGION_TO_CURRENCY[region]) return REGION_TO_CURRENCY[region];
  }
  return "USD";
}

export function convertFromUsd(usdAmount: number, currencyCode: string): number {
  const currency = CURRENCIES[currencyCode] ?? CURRENCIES.USD;
  return usdAmount * currency.rate;
}

export function formatPrice(usdAmount: number, currencyCode: string): string {
  const currency = CURRENCIES[currencyCode] ?? CURRENCIES.USD;
  const converted = convertFromUsd(usdAmount, currencyCode);
  try {
    return new Intl.NumberFormat(currency.locale, {
      style: "currency",
      currency: currency.code,
      currencyDisplay: "symbol",
    }).format(converted);
  } catch {
    // Fallback if Intl doesn't recognize the currency in this environment
    return `${currency.symbol}${converted.toFixed(2)}`;
  }
}