// Server-only wrapper around Paystack's REST API.
// Never import this from a client component — it reads the secret key.

const PAYSTACK_BASE_URL = "https://api.paystack.co";

function getSecretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) {
    throw new Error(
      "PAYSTACK_SECRET_KEY is not set. Add it to your server environment (never expose it to the client)."
    );
  }
  return key;
}

interface InitializeTransactionParams {
  /** Amount in the smallest currency unit — for NGN that's kobo (₦1 = 100 kobo). */
  amountInSubunits: number;
  email: string;
  currency: "NGN" | "USD" | "GHS" | "ZAR" | "KES";
  /** Your own unique reference, e.g. `coins_${userId}_${Date.now()}` — lets you reconcile webhooks. */
  reference: string;
  /** Where Paystack sends the browser after payment (still verify via webhook, don't trust this alone). */
  callbackUrl: string;
  metadata?: Record<string, unknown>;
}

interface InitializeTransactionResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export async function initializeTransaction(
  params: InitializeTransactionParams
): Promise<InitializeTransactionResponse> {
  const res = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: params.amountInSubunits,
      email: params.email,
      currency: params.currency,
      reference: params.reference,
      callback_url: params.callbackUrl,
      metadata: params.metadata,
    }),
  });

  const data = await res.json();
  console.log(data)
  if (!res.ok || !data.status) {
    throw new Error(data.message ?? "Paystack initialize failed");
  }
  return data;
}

interface VerifyTransactionResponse {
  status: boolean;
  message: string;
  data: {
    status: "success" | "failed" | "abandoned";
    reference: string;
    amount: number;
    currency: string;
    metadata: Record<string, unknown>;
  };
}

// Call this from the webhook (and optionally again from a "thank you" page)
// as the source of truth. Never credit coins based solely on the client
// redirect — that URL param is easy to fake.
export async function verifyTransaction(
  reference: string
): Promise<VerifyTransactionResponse> {
  const res = await fetch(
    `${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: { Authorization: `Bearer ${getSecretKey()}` },
    }
  );

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message ?? "Paystack verify failed");
  }
  return data;
}