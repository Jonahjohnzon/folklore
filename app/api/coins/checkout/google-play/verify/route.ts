// app/api/coins/checkout/google-play/verify/route.ts
import { withAuth } from "@/app/api/auth/withAuth";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { Transaction } from "@/app/api/lib/models/Transaction";
import { User, IUser } from "@/app/api/lib/models/User";
import { COIN_PACKAGES, totalCoins } from "@/lib/coin-packages";
import { verifyGooglePlayPurchase, consumeGooglePlayPurchase } from "@/lib/googlePlay";
import { ok, fail } from "@/app/api/response";

export const POST = withAuth(async (req) => {
  try {
    const { packageId, productId, purchaseToken } = await req.json();

    const pkg = COIN_PACKAGES.find((p) => p.id === packageId);
    if (!pkg) return fail(new Error("Unknown package"));
    if (pkg.playProductId !== productId) return fail(new Error("Product/package mismatch"));
    if (!purchaseToken) return fail(new Error("Missing purchase token"));

    await connectToDatabase();

    const existing = await Transaction.findOne({ providerReference: purchaseToken });
    if (existing?.status === "completed") {
      const user = await User.findById(existing.userId).select("coinBalance").lean();
      return ok({
        status: "completed",
        coinsCredited: existing.coins,
        newBalance: (user as IUser)?.coinBalance ?? 0,
      });
    }

    const { isValid, isAlreadyConsumed } = await verifyGooglePlayPurchase(productId, purchaseToken);
    if (!isValid) return fail(new Error("Purchase could not be verified"));
    if (isAlreadyConsumed) return fail(new Error("This purchase has already been redeemed"));

    await Transaction.create({
      userId: req.user.sub,
      type: "purchase",
      status: "completed",
      coins: totalCoins(pkg),
      label: `Bought ${totalCoins(pkg).toLocaleString()} coins`,
      paymentMethod: "google_play",
      packageId,
      providerReference: purchaseToken,
    });

    const user = await User.findByIdAndUpdate(
      req.user.sub,
      { $inc: { coinBalance: totalCoins(pkg) } },
      { new: true }
    ).select("coinBalance");

    await consumeGooglePlayPurchase(productId, purchaseToken);

    return ok({
      status: "completed",
      coinsCredited: totalCoins(pkg),
      newBalance: (user as IUser)?.coinBalance ?? 0,
    });
  } catch (error) {
    return fail(error);
  }
});