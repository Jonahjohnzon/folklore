import { Transaction } from "@/app/api/lib/models/Transaction";
import { createCryptomusInvoice } from "@/lib/payments/cryptomus";

interface StartCheckoutInput {
  userId: string;
  packageId: string;
  usdAmount: number;
  reference: string;
}

interface StartCheckoutResult {
  paymentUrl: string;
}

export const cryptoCheckoutProvider = {
  async startCheckout({ userId, packageId, usdAmount, reference }: StartCheckoutInput): Promise<StartCheckoutResult> {
    // Pending transaction row now, so the webhook has something to find and
    // finalize when it lands. coins is 0 here — filled in by the caller's
    // package lookup at webhook time, or you can pass it in if you prefer
    // to snapshot it now (see note below).
    await Transaction.create({
      userId,
      type: "purchase",
      status: "pending",
      coins: 0, // set to the actual package coin amount below
      label: "Coin purchase (crypto) — pending",
      paymentMethod: "crypto",
      packageId,
      amount: usdAmount,
      currency: "USD",
      providerReference: reference,
    });

    const invoice = await createCryptomusInvoice({
      amount: usdAmount.toFixed(2),
      currency: "USD",
      orderId: reference,
      urlReturn: `https://yourdomain.com/coins?status=pending`,
      urlCallback: `https://yourdomain.com/api/payments/crypto/webhook`,
    });

    return { paymentUrl: invoice.url };
  },
};