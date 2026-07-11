import { Transaction } from "@/app/api/lib/models/Transaction";
import { createCryptomusInvoice } from "@/app/api/lib/payments/cryptomus";

interface StartCheckoutInput {
  userId: string;
  packageId: string;
  usdAmount: number;
  coins: number; // pre-resolved total (base + bonus) from totalCoins(pkg)
  reference: string;
}

interface StartCheckoutResult {
  paymentUrl: string;
}

export const cryptoCheckoutProvider = {
  async startCheckout({
    userId,
    packageId,
    usdAmount,
    coins,
    reference,
  }: StartCheckoutInput): Promise<StartCheckoutResult> {
    await Transaction.create({
      userId,
      type: "purchase",
      status: "pending",
      coins,
      label: `Coin purchase (crypto) — pending`,
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
      urlReturn: `https://tipatale.com/coins?status=pending`,
      urlCallback: `https://tipatale.com/api/payments/crypto/webhook`,
    });

    return { paymentUrl: invoice.url };
  },
};