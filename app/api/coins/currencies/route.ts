import { SUPPORTED_CURRENCIES, type PaystackCurrency } from "@/lib/coin-packages";
import { ok } from "@/app/api/response";

const PAYSTACK_CONFIGURED: Record<PaystackCurrency, boolean> = {
  NGN: !!process.env.PAYSTACK_SECRET_KEY,
  GHS: !!process.env.PAYSTACK_SECRET_KEY_GHS,
  ZAR: !!process.env.PAYSTACK_SECRET_KEY_ZAR,
  KES: !!process.env.PAYSTACK_SECRET_KEY_KES,
  USD: !!process.env.PAYSTACK_SECRET_KEY_USD,
};

// Flutterwave uses one account for every currency, so once it's configured
// at all, every currency we price packages in is fair game.
const FLUTTERWAVE_CONFIGURED = !!process.env.FLUTTERWAVE_SECRET_KEY;

export const GET = async (req: Request) => {
  const method = new URL(req.url).searchParams.get("method") ?? "paystack";

  const currencies =
    method === "flutterwave"
      ? FLUTTERWAVE_CONFIGURED
        ? SUPPORTED_CURRENCIES
        : []
      : SUPPORTED_CURRENCIES.filter((c) => PAYSTACK_CONFIGURED[c.code]);

  return ok({ currencies });
};