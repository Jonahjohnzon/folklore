import { SUPPORTED_CURRENCIES, type PaystackCurrency } from "@/lib/coin-packages";
import { ok } from "@/app/api/response";

// Mirrors the map in the checkout route — a currency only counts as "available"
// if its secret key is actually set.
const CONFIGURED: Record<PaystackCurrency, boolean> = {
  NGN: !!process.env.PAYSTACK_SECRET_KEY,
  GHS: !!process.env.PAYSTACK_SECRET_KEY_GHS,
  ZAR: !!process.env.PAYSTACK_SECRET_KEY_ZAR,
  KES: !!process.env.PAYSTACK_SECRET_KEY_KES,
  USD: !!process.env.PAYSTACK_SECRET_KEY_USD,
};

export const GET = async () => {
  const available = SUPPORTED_CURRENCIES.filter((c) => CONFIGURED[c.code]);
  return ok({ currencies: available });
};