export interface CoinPackage {
  id: string;
  coins: number;
  bonusCoins: number;
  popular?: boolean;
  playProductId: string; // must match Google Play Console product ID exactly
}

export const COIN_PACKAGES: CoinPackage[] = [
  { id: "starter", coins: 100, bonusCoins: 0, playProductId: "coins_starter" },
  { id: "popular", coins: 550, bonusCoins: 50, popular: true, playProductId: "coins_popular" },
  { id: "value", coins: 1200, bonusCoins: 150, playProductId: "coins_value" },
  { id: "plus", coins: 2500, bonusCoins: 400, playProductId: "coins_plus" },
  { id: "max", coins: 6500, bonusCoins: 1200, playProductId: "coins_max" },
  { id: "whale", coins: 14000, bonusCoins: 3000, playProductId: "coins_whale" },
];

export function totalCoins(pkg: CoinPackage): number {
  return pkg.coins + pkg.bonusCoins;
}

export function bonusPercent(pkg: CoinPackage): number {
  return pkg.coins > 0 ? Math.round((pkg.bonusCoins / pkg.coins) * 100) : 0;
}

// No price fields, no currencies, no FX — Google Play is the single source of
// truth for what a package costs. The app reads live localized prices straight
// from Google via useIAP's `product.displayPrice` (see CoinsScreen.tsx).
// The web page never charges money, so it never needs a price at all.