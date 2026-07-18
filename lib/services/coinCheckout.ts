import type { PaystackCurrency } from "@/lib/coin-packages";

export interface StartCheckoutParams {
  packageId: string;
  email: string;
  currency?: PaystackCurrency;
}

export class CheckoutError extends Error {}

async function postCheckout(url: string, params: StartCheckoutParams) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const json = await res.json();
  if (!json.success) throw new CheckoutError(json.error?.message ?? "Could not start checkout");
  return json.data as { authorizationUrl: string; reference: string };
}

export function startCoinCheckout(params: StartCheckoutParams) {
  return postCheckout("/api/coins/checkout", params);
}

export function startFlutterwaveCheckout(params: StartCheckoutParams) {
  return postCheckout("/api/coins/checkout/flutterwave", params);
}

export async function startCryptoCheckout(params: StartCheckoutParams) {
  const res = await fetch("/api/coins/checkout/crypto", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const json = await res.json();
  if (!res.ok || !json.ok) throw new CheckoutError(json.error?.message ?? "Could not start crypto checkout");
  return json.data as { paymentUrl: string; reference: string };
}

export function goToCheckout(url: string) {
  window.location.assign(url);
}