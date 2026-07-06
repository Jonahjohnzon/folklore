export interface StartCheckoutParams {
  packageId: string;
  email: string;
}

export class CheckoutError extends Error {}

export async function startCoinCheckout(params: StartCheckoutParams) {
  const res = await fetch("/api/coins/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const json = await res.json();
  if (!json.success) throw new CheckoutError(json.error?.message ?? "Could not start checkout");
  return json.data as { authorizationUrl: string; reference: string };
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