import { withAuth } from "@/app/api/auth/withAuth";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { Transaction } from "@/app/api/lib/models/Transaction";
import { User } from "@/app/api/lib/models/User";
import { COIN_PACKAGES, totalCoins, priceFor, type PaystackCurrency } from "@/lib/coin-packages";
import { ok, fail } from "@/app/api/response";
import { Types } from "mongoose";

// Flutterwave, unlike Paystack, lets a single business account collect
// several currencies at once — no separate sub-account per country needed.
const ALLOWED_CURRENCIES: PaystackCurrency[] = ["NGN", "GHS", "ZAR", "KES", "USD"];

export const POST = withAuth(async (req) => {
  try {
    const { packageId, email, currency } = await req.json();

    const pkg = COIN_PACKAGES.find((p) => p.id === packageId);
    if (!pkg) return fail(new Error("Unknown package"));
    if (!email) return fail(new Error("Email is required"));

    const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
    if (!secretKey) return fail(new Error("Flutterwave isn't set up yet."));

    const cur: PaystackCurrency = ALLOWED_CURRENCIES.includes(currency) ? currency : "NGN";
    const amount = priceFor(pkg, cur);

    if (amount === undefined || amount === null || Number.isNaN(amount)) {
      return fail(new Error(`No price configured for package "${pkg.id}" in ${cur}`));
    }
    if (!process.env.APP_URL) {
      return fail(new Error("APP_URL is not set in the environment"));
    }

    await connectToDatabase();

    // Flutterwave requires customer.name for card-only currencies (e.g. USD).
    // Prefer a real name over guessing from the email — displayName is what
    // the person actually set for themselves, username is the guaranteed fallback.
    const user = await User.findById(req.user.sub).select("displayName username").lean();
    const customerName = user?.displayName?.trim() || user?.username || email.split("@")[0];

    const reference = `coins_fw_${req.user.sub}_${Date.now()}`;

    const fwRes = await fetch("https://api.flutterwave.com/v3/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tx_ref: reference,
        amount, // Flutterwave expects the major unit (e.g. 500 NGN), not kobo — unlike Paystack
        currency: cur,
        redirect_url: `${process.env.APP_URL}/coins/thank-you?reference=${reference}&provider=flutterwave`,
        customer: {
          email,
          name: customerName,
        },
        customizations: {
          title: "Buy coins",
          description: `${totalCoins(pkg).toLocaleString()} coins`,
        },
        meta: { packageId, userId: req.user.sub },
      }),
    });

    const data = await fwRes.json();
    if (!fwRes.ok || data.status !== "success") {
      throw new Error(data.message ?? "Flutterwave initialize failed");
    }

    await Transaction.create({
      userId: new Types.ObjectId(req.user.sub),
      type: "purchase",
      status: "pending",
      coins: totalCoins(pkg),
      label: `Bought ${totalCoins(pkg).toLocaleString()} coins`,
      paymentMethod: "flutterwave",
      packageId,
      amount,
      currency: cur,
      providerReference: reference,
    });

    return ok({ authorizationUrl: data.data.link, reference });
  } catch (error) {
    return fail(error);
  }
});