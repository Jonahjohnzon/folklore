// Client-side service. No secrets live here — it just talks to your own
// /api/coins/checkout route, which is the only thing holding the Paystack key.

export interface StartCheckoutParams {
  packageId: string;
  currencyCode: string;
  email: string;
}

export interface StartCheckoutResult {
  authorizationUrl: string;
  reference: string;
}

export class CheckoutError extends Error {}

export async function startCoinCheckout(
  params: StartCheckoutParams
): Promise<StartCheckoutResult> {
  const res = await fetch("/api/coins/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  const json = await res.json();

  if (!res.ok || !json.ok) {
    throw new CheckoutError(json.error?.message ?? "Could not start checkout");
  }

  return json.data as StartCheckoutResult;
}

// Redirects the browser to Paystack's hosted payment page.
// Call this from a click handler, e.g.:
//
//   const { authorizationUrl } = await startCoinCheckout({ packageId, currencyCode, email });
//   goToCheckout(authorizationUrl);
export function goToCheckout(authorizationUrl: string) {
  window.location.assign(authorizationUrl);
}