import { withAuth } from "@/app/api/auth/withAuth";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { Transaction } from "@/app/api/lib/models/Transaction";
import { COIN_PACKAGES, totalCoins } from "@/lib/coin-packages";
import { ok, fail } from "@/app/api/response";
import { Types } from "mongoose";

export const POST = withAuth(async (req) => {
  try {
    const { packageId, email } = await req.json();

    const pkg = COIN_PACKAGES.find((p) => p.id === packageId);
    if (!pkg) return fail(new Error("Unknown package"));
    if (!email) return fail(new Error("Email is required"));

    await connectToDatabase();

    const reference = `coins_${req.user.sub}_${Date.now()}`;

    const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: Math.round(pkg.nairaPrice * 100), // kobo
        reference,
        callback_url: `${process.env.APP_URL}/payment/thank-you`,
        metadata: { packageId, userId: req.user.sub },
      }),
    });

    const data = await paystackRes.json();
    if (!paystackRes.ok || !data.status) {
      throw new Error(data.message ?? "Paystack initialize failed");
    }

    // Create the pending transaction now, so /verify has something to reconcile against
    // even if the user never makes it back to the thank-you page.
    await Transaction.create({
      userId: new Types.ObjectId(req.user.sub),
      type: "purchase",
      status: "pending",
      coins: totalCoins(pkg),
      label: `Bought ${totalCoins(pkg).toLocaleString()} coins`,
      paymentMethod: "paystack",
      packageId,
      amount: pkg.nairaPrice,
      currency: "NGN",
      providerReference: reference,
    });

    return ok({ authorizationUrl: data.data.authorization_url, reference });
  } catch (error) {
    return fail(error);
  }
});