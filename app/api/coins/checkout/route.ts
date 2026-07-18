import { withAuth } from "@/app/api/auth/withAuth";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { Transaction } from "@/app/api/lib/models/Transaction";
import { COIN_PACKAGES, totalCoins, priceFor, type PaystackCurrency } from "@/lib/coin-packages";
import { ok, fail } from "@/app/api/response";
import { Types } from "mongoose";

const ALLOWED_CURRENCIES: PaystackCurrency[] = ["NGN", "GHS", "ZAR", "KES", "USD"];

// A single Paystack secret key is tied to ONE settlement currency for most
// businesses (NGN/KES accounts can also add USD alongside their base currency).
// To genuinely support GHS/ZAR/KES/USD you need a separate Paystack business
// account + secret key per currency, provisioned by Paystack. Map them here
// once you have them — everything else in this route is currency-agnostic.
const PAYSTACK_SECRET_KEY_BY_CURRENCY: Partial<Record<PaystackCurrency, string | undefined>> = {
  NGN: process.env.PAYSTACK_SECRET_KEY,
  GHS: process.env.PAYSTACK_SECRET_KEY_GHS,
  ZAR: process.env.PAYSTACK_SECRET_KEY_ZAR,
  KES: process.env.PAYSTACK_SECRET_KEY_KES,
  USD: process.env.PAYSTACK_SECRET_KEY_USD, // only valid if your NGN/KES account has USD enabled
};

export const POST = withAuth(async (req) => {
  try {
    const { packageId, email, currency } = await req.json();

    const pkg = COIN_PACKAGES.find((p) => p.id === packageId);
    if (!pkg) return fail(new Error("Unknown package"));
    if (!email) return fail(new Error("Email is required"));

    const cur: PaystackCurrency = ALLOWED_CURRENCIES.includes(currency) ? currency : "NGN";
    const secretKey = PAYSTACK_SECRET_KEY_BY_CURRENCY[cur];
    if (!secretKey) return fail(new Error(`Payments in ${cur} aren't set up yet.`));

    const amount = priceFor(pkg, cur);

    await connectToDatabase();

    const reference = `coins_${req.user.sub}_${Date.now()}`;

    const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: Math.round(amount * 100), // subunits (kobo/pesewas/cents)
        currency: cur,
        reference,
        callback_url: `${process.env.APP_URL}/coins/thank-you?reference=${reference}`,
        metadata: { packageId, userId: req.user.sub },
      }),
    });

    const data = await paystackRes.json();
    if (!paystackRes.ok || !data.status) {
      throw new Error(data.message ?? "Paystack initialize failed");
    }

    await Transaction.create({
      userId: new Types.ObjectId(req.user.sub),
      type: "purchase",
      status: "pending",
      coins: totalCoins(pkg),
      label: `Bought ${totalCoins(pkg).toLocaleString()} coins`,
      paymentMethod: "paystack",
      packageId,
      amount,
      currency: cur,
      providerReference: reference,
    });

    return ok({ authorizationUrl: data.data.authorization_url, reference });
  } catch (error) {
    return fail(error);
  }
});