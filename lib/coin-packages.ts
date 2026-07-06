export interface CoinPackage {
  id: string;
  baseCoins: number;
  bonusCoins: number;
  usdPrice: number;
  /** Curated, not derived — this is the one subjective badge we allow. */
  popular?: boolean;
}

export const COIN_PACKAGES: CoinPackage[] = [
  { id: "starter", baseCoins: 100, bonusCoins: 0, usdPrice: 0.99 },
  { id: "popular", baseCoins: 500, bonusCoins: 50, usdPrice: 4.99, popular: true },
  { id: "value", baseCoins: 1000, bonusCoins: 200, usdPrice: 9.99 },
  { id: "plus", baseCoins: 2000, bonusCoins: 600, usdPrice: 19.99 },
  { id: "pro", baseCoins: 5000, bonusCoins: 2000, usdPrice: 49.99 },
  { id: "max", baseCoins: 10000, bonusCoins: 5000, usdPrice: 99.99 },
];

export function totalCoins(pkg: CoinPackage): number {
  return pkg.baseCoins + pkg.bonusCoins;
}

export function bonusPercent(pkg: CoinPackage): number {
  if (pkg.baseCoins === 0) return 0;
  return Math.round((pkg.bonusCoins / pkg.baseCoins) * 100);
}

/** Cost in USD cents per coin — the figure that actually reveals which pack is the best deal. */
export function costPerCoin(pkg: CoinPackage): number {
  return (pkg.usdPrice * 100) / totalCoins(pkg);
}

/** The package with the lowest cost-per-coin — computed, not curated. */
export function bestValuePackageId(): string {
  return COIN_PACKAGES.reduce((best, pkg) =>
    costPerCoin(pkg) < costPerCoin(best) ? pkg : best
  ).id;
}