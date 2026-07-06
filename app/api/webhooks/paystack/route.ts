import { connectToDatabase } from "@/app/api/lib/db/connect";
import { Transaction } from "@/app/api/lib/models/Transaction";
import { User } from "@/app/api/lib/models/User";
import { ok, fail } from "@/app/api/response";
import crypto from "crypto";

export const POST = async (req: Request) => {
  try {
    const rawBody = await req.text();

    // Confirm this request really came from Paystack, not a spoofed call.
    const signature = req.headers.get("x-paystack-signature");
    const expected = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
      .update(rawBody)
      .digest("hex");

    if (signature !== expected) {
      return fail(new Error("Invalid signature"));
    }

    const event = JSON.parse(rawBody);

    if (event.event === "charge.success") {
      const reference = event.data.reference;

      await connectToDatabase();

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

    if (event.event === "charge.failed") {
      await connectToDatabase();
      await Transaction.updateOne(
        { providerReference: event.data.reference, status: "pending" },
        { status: "failed" }
      );
    }

    // Always 200 quickly — Paystack retries on non-200, you don't want duplicate processing storms.
    return ok({ received: true });
  } catch (error) {
    return fail(error);
  }
};