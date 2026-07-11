import crypto from "crypto";

const CRYPTOMUS_API_URL = "https://api.cryptomus.com/v1";
const MERCHANT_ID = process.env.CRYPTOMUS_MERCHANT_ID!;
const PAYMENT_API_KEY = process.env.CRYPTOMUS_PAYMENT_API_KEY!;

function sign(payload: Record<string, unknown>): string {
  const base64Body = Buffer.from(JSON.stringify(payload), "utf-8").toString("base64");
  return crypto.createHash("md5").update(base64Body + PAYMENT_API_KEY).digest("hex");
}

interface CreateInvoiceInput {
  amount: string;
  currency: string;
  orderId: string;
  urlReturn?: string;
  urlCallback: string;
  lifetime?: number;
}

interface CryptomusInvoiceResult {
  uuid: string;
  order_id: string;
  amount: string;
  currency: string;
  url: string;
  status: string;
}

export async function createCryptomusInvoice(
  input: CreateInvoiceInput
): Promise<CryptomusInvoiceResult> {
  const body = {
    amount: input.amount,
    currency: input.currency,
    order_id: input.orderId,
    url_return: input.urlReturn,
    url_callback: input.urlCallback,
    lifetime: input.lifetime ?? 3600,
  };

  const res = await fetch(`${CRYPTOMUS_API_URL}/payment`, {
    method: "POST",
    headers: {
      merchant: MERCHANT_ID,
      sign: sign(body),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const json = await res.json();

  if (!res.ok || json.state !== 0) {
    throw new Error(json.message || "Cryptomus invoice creation failed");
  }

  return json.result as CryptomusInvoiceResult;
}

export function verifyCryptomusWebhook(rawBody: Record<string, unknown>): boolean {
  const { sign: incomingSign, ...rest } = rawBody;
  if (typeof incomingSign !== "string") return false;

  const base64Body = Buffer.from(JSON.stringify(rest), "utf-8").toString("base64");
  const expected = crypto
    .createHash("md5")
    .update(base64Body + PAYMENT_API_KEY)
    .digest("hex");

  return (
    incomingSign.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(incomingSign), Buffer.from(expected))
  );
}