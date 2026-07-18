import { withAuth } from "@/app/api/auth/withAuth";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { Transaction } from "@/app/api/lib/models/Transaction";
import { User, IUser } from "@/app/api/lib/models/User";
import { COIN_PACKAGES, totalCoins, type PaystackCurrency } from "@/lib/coin-packages";
import { formatMoney } from "@/lib/currency";
import { ok, fail } from "@/app/api/response";

function amountLabelFor(txn: { amount?: number; currency?: string }): string {
  const currency = (txn.currency as PaystackCurrency) ?? "NGN";
  return formatMoney(txn.amount ?? 0, currency);
}

export const GET = withAuth(async (req) => {
  try {
    const reference = new URL(req.url).searchParams.get("reference");
    if (!reference) return fail(new Error("Missing reference"));

    await connectToDatabase();

    const txn = await Transaction.findOne({ providerReference: reference, userId: req.user.sub });
    if (!txn) return fail(new Error("Transaction not found"));

    // Already reconciled — return cached result, don't re-credit or re-call Flutterwave.
    if (txn.status === "completed") {
      const user = await User.findById(txn.userId).select("coinBalance").lean();
      const pkg = COIN_PACKAGES.find((p) => p.id === txn.packageId);
      return ok({
        status: "completed",
        coinsCredited: txn.coins,
        newBalance: (user as IUser)?.coinBalance ?? txn.balanceAfter,
        packageLabel: pkg ? `${totalCoins(pkg).toLocaleString()} coins` : "Coins",
        amountLabel: amountLabelFor(txn),
        reference,
      });
    }

    const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
    if (!secretKey) return fail(new Error("Flutterwave isn't set up."));

    const fwRes = await fetch(
      `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${encodeURIComponent(reference)}`,
      { headers: { Authorization: `Bearer ${secretKey}` } }
    );
    const fwData = await fwRes.json();

    if (!fwRes.ok || fwData.status !== "success") {
      return fail(new Error(fwData.message ?? "Verification failed"));
    }

    const txStatus = fwData.data?.status; // "successful" | "failed" | "cancelled" | ...
    const paidAmount = fwData.data?.amount;
    const paidCurrency = fwData.data?.currency;

    // Guard against amount/currency tampering — the charge must match what was requested.
    const amountMatches = paidAmount >= (txn.amount ?? 0) && paidCurrency === txn.currency;

    if (txStatus === "successful" && amountMatches) {
      // Atomic guard on status:"pending" so a retried request can't double-credit.
      const updatedTxn = await Transaction.findOneAndUpdate(
        { providerReference: reference, status: "pending" },
        { status: "completed" },
        { new: true }
      );

      const user = await User.findByIdAndUpdate(
        txn.userId,
        updatedTxn ? { $inc: { coinBalance: txn.coins } } : {},
        { new: true }
      ).select("coinBalance");

      const pkg = COIN_PACKAGES.find((p) => p.id === txn.packageId);
      return ok({
        status: "completed",
        coinsCredited: txn.coins,
        newBalance: (user as IUser)?.coinBalance ?? 0,
        packageLabel: pkg ? `${totalCoins(pkg).toLocaleString()} coins` : "Coins",
        amountLabel: amountLabelFor(txn),
        reference,
      });
    }

    if (txStatus === "successful" && !amountMatches) {
      // They paid, but not the right amount/currency — flag rather than credit silently.
      await Transaction.updateOne({ providerReference: reference }, { status: "failed" });
      return ok({ status: "failed", reference, reason: "amount_mismatch" });
    }

    if (txStatus === "failed" || txStatus === "cancelled") {
      await Transaction.updateOne({ providerReference: reference }, { status: "failed" });
      return ok({ status: "failed", reference });
    }

    return ok({ status: "pending", reference });
  } catch (error) {
    return fail(error);
  }
});