import { withAuth } from "@/app/api/auth/withAuth";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { Transaction } from "@/app/api/lib/models/Transaction";
import { User, IUser } from "@/app/api/lib/models/User";
import { COIN_PACKAGES, totalCoins } from "@/lib/coin-packages";
import { formatNaira } from "@/lib/currency";
import { ok, fail } from "@/app/api/response";

export const GET = withAuth(async (req) => {
  try {
    const reference = new URL(req.url).searchParams.get("reference");
    if (!reference) return fail(new Error("Missing reference"));

    await connectToDatabase();

    const txn = await Transaction.findOne({ providerReference: reference, userId: req.user.sub });
    if (!txn) return fail(new Error("Transaction not found"));

    // Already reconciled — return cached result, don't re-credit or re-call Paystack.
    if (txn.status === "completed") {
      const user = await User.findById(txn.userId).select("preferences").lean();
      const pkg = COIN_PACKAGES.find((p) => p.id === txn.packageId);
      return ok({
        status: "completed",
        coinsCredited: txn.coins,
        newBalance: (user as IUser)?.coinBalance ?? txn.balanceAfter,
        packageLabel: pkg ? `${totalCoins(pkg).toLocaleString()} coins` : "Coins",
        amountLabel: txn.currency === "NGN" ? formatNaira(txn.amount ?? 0) : `$${txn.amount}`,
        reference,
      });
    }

    // Ask Paystack for the real status — never trust the client on this.
    const psRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
    });
    const psData = await psRes.json();

    if (!psRes.ok || !psData.status) {
      return fail(new Error(psData.message ?? "Verification failed"));
    }

    const paystackStatus = psData.data?.status; // "success" | "failed" | "abandoned"

    if (paystackStatus === "success") {
      // Credit atomically and flip the transaction to completed in one go,
      // guarded by status:"pending" so a retried request can't double-credit.
      const updatedTxn = await Transaction.findOneAndUpdate(
        { providerReference: reference, status: "pending" },
        { status: "completed" },
        { new: true }
      );

      // If updatedTxn is null here, another request already completed it — just re-read below.
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
        amountLabel: txn.currency === "NGN" ? formatNaira(txn.amount ?? 0) : `$${txn.amount}`,
        reference,
      });
    }

    if (paystackStatus === "failed" || paystackStatus === "abandoned") {
      await Transaction.updateOne({ providerReference: reference }, { status: "failed" });
      return ok({ status: "failed", reference });
    }

    // Still processing on Paystack's end
    return ok({ status: "pending", reference });
  } catch (error) {
    return fail(error);
  }
});