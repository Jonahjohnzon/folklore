export interface CoinPackage {
  id: string;
  coins: number;
  bonusCoins: number;
  nairaPrice: number; // what Paystack actually charges, in ₦
  usdPrice: number;   // what the crypto checkout actually charges, in $
  popular?: boolean;
}

// These two prices are NOT required to match at some fixed FX rate — set
// each one to whatever you actually want to charge in that market/rail.
export const COIN_PACKAGES: CoinPackage[] = [
  { id: "starter", coins: 100, bonusCoins: 0, nairaPrice: 1000, usdPrice: 0.99 },
  { id: "popular", coins: 550, bonusCoins: 50, nairaPrice: 5500, usdPrice: 4.99, popular: true },
  { id: "value", coins: 1200, bonusCoins: 150, nairaPrice: 12000, usdPrice: 9.99 },
  { id: "plus", coins: 2500, bonusCoins: 400, nairaPrice: 25000, usdPrice: 19.99 },
  { id: "max", coins: 6500, bonusCoins: 1200, nairaPrice: 65000, usdPrice: 49.99 },
  { id: "whale", coins: 14000, bonusCoins: 3000, nairaPrice: 140000, usdPrice: 99.99 },
];

export function totalCoins(pkg: CoinPackage): number {
  return pkg.coins + pkg.bonusCoins;
}

export function bonusPercent(pkg: CoinPackage): number {
  return pkg.coins > 0 ? Math.round((pkg.bonusCoins / pkg.coins) * 100) : 0;
}

// Cost-per-coin depends on which currency you're comparing in.
export function costPerCoinNaira(pkg: CoinPackage): number {
  return pkg.nairaPrice / totalCoins(pkg);
}
export function costPerCoinUsd(pkg: CoinPackage): number {
  return pkg.usdPrice / totalCoins(pkg);
}

export function bestValuePackageId(currency: "NGN" | "USD"): string {
  const costFn = currency === "NGN" ? costPerCoinNaira : costPerCoinUsd;
  return COIN_PACKAGES.reduce((best, p) => (costFn(p) < costFn(best) ? p : best)).id;
}