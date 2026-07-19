import { withAuth } from "@/app/api/auth/withAuth";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { Transaction } from "@/app/api/lib/models/Transaction";
import { User, IUser } from "@/app/api/lib/models/User";
import { COIN_PACKAGES, totalCoins, type PaystackCurrency } from "@/lib/coin-packages";
import { formatMoney } from "@/lib/currency";
import { ok, fail } from "@/app/api/response";

// txn.currency is whatever was stored at checkout time — fall back to NGN
// for any older transactions written before multi-currency support existed.
function amountLabelFor(txn: { amount?: number; currency?: string }): string {
  const currency = (txn.currency as PaystackCurrency) ?? "NGN";
  return formatMoney(txn.amount ?? 0, currency);
}

// Returns { success, failed } — success means "credit the coins now",
// failed means "mark it failed", and neither means "still pending, poll again".
async function verifyWithPaystack(reference: string) {
  const psRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
  });
  const psData = await psRes.json();

  if (!psRes.ok || !psData.status) {
    throw new Error(psData.message ?? "Verification failed");
  }

  const paystackStatus = psData.data?.status; // "success" | "failed" | "abandoned"
  return {
    success: paystackStatus === "success",
    failed: paystackStatus === "failed" || paystackStatus === "abandoned",
  };
}

async function verifyWithFlutterwave(
  reference: string,
  transactionId: string | null,
  txn: { amount?: number; currency?: string }
) {
  const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
  if (!secretKey) throw new Error("Flutterwave isn't set up.");

  // Prefer the ID-based verify endpoint (what Flutterwave's own docs use);
  // fall back to reference-based lookup if the ID somehow wasn't in the redirect.
  const verifyUrl = transactionId
    ? `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`
    : `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${encodeURIComponent(reference)}`;

  const fwRes = await fetch(verifyUrl, { headers: { Authorization: `Bearer ${secretKey}` } });
  const fwData = await fwRes.json();

  if (!fwRes.ok || fwData.status !== "success") {
    throw new Error(fwData.message ?? "Verification failed");
  }

  // Tie the verified transaction back to *our* record — never trust the ID alone.
  if (fwData.data?.tx_ref !== reference) {
    throw new Error("Reference mismatch during verification");
  }

  const fwStatus = fwData.data?.status; // "successful" | "failed" | "cancelled"
  const amountMatches = fwData.data?.amount >= (txn.amount ?? 0) && fwData.data?.currency === txn.currency;

  return {
    success: fwStatus === "successful" && amountMatches,
    failed: fwStatus === "failed" || fwStatus === "cancelled" || (fwStatus === "successful" && !amountMatches),
  };
}

export const GET = withAuth(async (req) => {
  try {
    const url = new URL(req.url);
    const reference = url.searchParams.get("reference");
    const transactionId = url.searchParams.get("transaction_id"); // only present on Flutterwave redirects

    if (!reference) return fail(new Error("Missing reference"));
    console.log(reference)
    await connectToDatabase();

    const txn = await Transaction.findOne({ providerReference: reference, userId: req.user.sub });
    if (!txn) return fail(new Error("Transaction not found"));

    // Already reconciled — return cached result, don't re-credit or re-call the provider.
    if (txn.status === "completed") {
      const user = await User.findById(txn.userId).select("preferences").lean();
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

    // Ask the actual provider for the real status — never trust the client on this.
    // Which provider depends on how this transaction was checked out, not on the
    // request — so a stale/forged query param can't send it down the wrong path.
    const result =
      txn.paymentMethod === "flutterwave"
        ? await verifyWithFlutterwave(reference, transactionId, txn)
        : await verifyWithPaystack(reference);

    if (result.success) {
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
        amountLabel: amountLabelFor(txn),
        reference,
      });
    }

    if (result.failed) {
      await Transaction.updateOne({ providerReference: reference }, { status: "failed" });
      return ok({ status: "failed", reference });
    }

    // Still processing on the provider's end
    return ok({ status: "pending", reference });
  } catch (error) {
    return fail(error);
  }
});