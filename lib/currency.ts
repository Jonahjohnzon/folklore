export function formatNaira(amount: number): string {
  try {
    return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(amount);
  } catch {
    return `₦${amount.toFixed(2)}`;
  }
}

export function formatUsd(amount: number): string {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
  } catch {
    return `$${amount.toFixed(2)}`;
  }
}

export function formatNairaPerCoin(n: number): string {
  return `₦${n.toFixed(3)}`;
}
export function formatUsdPerCoin(n: number): string {
  return `$${n.toFixed(4)}`;
}