import { connectToDatabase } from "@/app/api/lib/db/connect";
import { Transaction } from "@/app/api/lib/models/Transaction";
import { User } from "@/app/api/lib/models/User";
import { ok, fail } from "@/app/api/response";

export const POST = async (req: Request) => {
  try {
    const rawBody = await req.text();


    const signature = req.headers.get("verif-hash");
    const secretHash = process.env.FLUTTERWAVE_SECRET_HASH;

    if (!secretHash || signature !== secretHash) {
      return fail(new Error("Invalid signature"));
    }

    const event = JSON.parse(rawBody);

    if (event.event === "charge.completed" && event.data?.status === "successful") {
      const reference = event.data.tx_ref;
      const transactionId = event.data.id;

      await connectToDatabase();

      const txn = await Transaction.findOne({ providerReference: reference, paymentMethod: "flutterwave" });

      if (txn && txn.status === "pending") {
        // Re-fetch the charge directly from Flutterwave rather than trusting the
        // webhook body — confirms amount, currency, and status independently.
        const fwRes = await fetch(`https://api.flutterwave.com/v3/transactions/${transactionId}/verify`, {
          headers: { Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}` },
        });
        const fwData = await fwRes.json();

        const verified =
          fwRes.ok &&
          fwData.status === "success" &&
          fwData.data?.status === "successful" &&
          fwData.data?.tx_ref === reference &&
          fwData.data?.amount >= (txn.amount ?? 0) &&
          fwData.data?.currency === txn.currency;

        if (verified) {
          // Same idempotency guard as the /verify route — whichever arrives first wins,
          // the other becomes a no-op.
          const updatedTxn = await Transaction.findOneAndUpdate(
            { providerReference: reference, status: "pending" },
            { status: "completed" },
            { new: true }
          );

          if (updatedTxn) {
            await User.findByIdAndUpdate(updatedTxn.userId, {
              $inc: { coinBalance: updatedTxn.coins },
            });
          }
        }
      }
    }

    if (event.event === "charge.completed" && (event.data?.status === "failed" || event.data?.status === "cancelled")) {
      await connectToDatabase();
      await Transaction.updateOne(
        { providerReference: event.data.tx_ref, status: "pending" },
        { status: "failed" }
      );
    }

    // Always 200 quickly — Flutterwave retries on non-200, you don't want duplicate processing storms.
    return ok({ received: true });
  } catch (error) {
    return fail(error);
  }
};