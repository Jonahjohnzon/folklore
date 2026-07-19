export type PaystackCurrency = "NGN" | "GHS" | "ZAR" | "KES" | "USD";

export const SUPPORTED_CURRENCIES: { code: PaystackCurrency; label: string; symbol: string }[] = [
  { code: "NGN", label: "Nigerian Naira", symbol: "₦" },
  { code: "GHS", label: "Ghanaian Cedi", symbol: "GH₵" },
  { code: "ZAR", label: "South African Rand", symbol: "R" },
  { code: "KES", label: "Kenyan Shilling", symbol: "KSh" },
  { code: "USD", label: "US Dollar", symbol: "$" },
];

export interface CoinPackage {
  id: string;
  coins: number;
  bonusCoins: number;
  popular?: boolean;
  // Real-money price per currency. Precomputed from mid-market FX rates as of
  // July 2026 (1 USD ≈ 1,380 NGN / 11.19 GHS / 16.50 ZAR / 129.44 KES), then
  // rounded to a "nice" number. NGN/GHS/KES move fast — re-check every few
  // weeks, ideally by pulling a live rate rather than hardcoding forever.
  prices: Record<PaystackCurrency, number>;
}

export const COIN_PACKAGES: CoinPackage[] = [
  {
    id: "starter", coins: 100, bonusCoins: 0,
    prices: { NGN: 1000, GHS: 11, ZAR: 17, KES: 130, USD: 1.00 },
  },
  {
    id: "popular", coins: 550, bonusCoins: 50, popular: true,
    prices: { NGN: 5500, GHS: 56, ZAR: 85, KES: 650, USD: 4.99 },
  },
  {
    id: "value", coins: 1200, bonusCoins: 150,
    prices: { NGN: 12000, GHS: 115, ZAR: 165, KES: 1300, USD: 9.99 },
  },
  {
    id: "plus", coins: 2500, bonusCoins: 400,
    prices: { NGN: 25000, GHS: 225, ZAR: 330, KES: 2600, USD: 19.99 },
  },
  {
    id: "max", coins: 6500, bonusCoins: 1200,
    prices: { NGN: 65000, GHS: 560, ZAR: 825, KES: 6500, USD: 49.99 },
  },
  {
    id: "whale", coins: 14000, bonusCoins: 3000,
    prices: { NGN: 140000, GHS: 1120, ZAR: 1650, KES: 13000, USD: 99.99 },
  },
];

export function totalCoins(pkg: CoinPackage): number {
  return pkg.coins + pkg.bonusCoins;
}

export function bonusPercent(pkg: CoinPackage): number {
  return pkg.coins > 0 ? Math.round((pkg.bonusCoins / pkg.coins) * 100) : 0;
}

export function priceFor(pkg: CoinPackage, currency: PaystackCurrency): number {
  return pkg.prices[currency];
}

export function costPerCoin(pkg: CoinPackage, currency: PaystackCurrency): number {
  return priceFor(pkg, currency) / totalCoins(pkg);
}

export function bestValuePackageId(currency: PaystackCurrency): string {
  return COIN_PACKAGES.reduce((best, p) =>
    costPerCoin(p, currency) < costPerCoin(best, currency) ? p : best
  ).id;
}