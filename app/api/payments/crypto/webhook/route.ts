import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { Transaction } from "@/app/api/lib/models/Transaction";
import { ProcessedWebhookEvent } from "@/app/api/lib/models/ProcessedWebhookEvent";
import { User } from "@/app/api/lib/models/User";
import { verifyCryptomusWebhook } from "@/lib/payments/cryptomus";

export async function POST(req: NextRequest) {
  await connectToDatabase();

  const raw = await req.json().catch(() => null);
  if (!raw) return NextResponse.json({ ok: false }, { status: 400 });

  if (!verifyCryptomusWebhook(raw)) {
    return NextResponse.json({ ok: false, error: "invalid signature" }, { status: 403 });
  }

  const { order_id: reference, status, is_final: isFinal } = raw as {
    order_id: string;
    status: string;
    is_final: boolean;
  };

  // Idempotency guard: this throws on duplicate insert (unique index on
  // `reference`), same pattern as your Paystack webhook already uses.
  try {
    await ProcessedWebhookEvent.create({ reference: `${reference}:${status}` });
  } catch {
    // already processed this exact reference+status combo — ack and exit
    return NextResponse.json({ ok: true });
  }

  const transaction = await Transaction.findOne({ providerReference: reference });
  if (!transaction) {
    return NextResponse.json({ ok: false, error: "transaction not found" }, { status: 404 });
  }

  if (transaction.status !== "pending") {
    return NextResponse.json({ ok: true }); // already finalized, nothing to do
  }

  if (status === "paid" || status === "paid_over") {
    const user = await User.findByIdAndUpdate(
      transaction.userId,
      { $inc: { coinBalance: transaction.coins } },
      { new: true }
    ).select("coinBalance");

    transaction.status = "completed";
    transaction.label = `Bought ${transaction.coins.toLocaleString()} coins (crypto)`;
    transaction.balanceAfter = user?.coinBalance;
    await transaction.save();
  } else if (isFinal && ["fail", "wrong_amount", "cancel", "system_fail"].includes(status)) {
    transaction.status = "failed";
    transaction.label = `Coin purchase failed (crypto)`;
    await transaction.save();
  }
  // non-final intermediate statuses (confirm_check, refund_process, etc.) — leave pending

  return NextResponse.json({ ok: true });
}