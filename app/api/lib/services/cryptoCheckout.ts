// This is intentionally a thin, provider-agnostic interface rather than a
// call to a specific vendor's endpoint. Reasons:
//
// 1. Nigeria's crypto rules run through the SEC's VASP licensing regime —
//    you generally want to route through a *licensed* on/off-ramp rather
//    than accept wallets directly yourself, to stay inside that framework.
//    Which provider is "the licensed one for you" is a decision worth a
//    conversation with a compliance-minded lawyer/accountant, not something
//    to hardcode based on a blog post.
// 2. Provider crypto-checkout APIs change faster than card APIs, and I
//    don't want to hand you a call to an endpoint I can't currently verify
//    is live and stable.
//
// Once you've picked a provider (e.g. a licensed VASP on/off-ramp, or a
// gateway's crypto product once you've confirmed its current docs),
// implement this interface with their actual API and swap it in below.

export interface CryptoCheckoutProvider {
  /**
   * Starts a crypto payment for a coin package. Should return a URL or
   * payment address/QR the user completes payment against, plus a
   * reference you can reconcile against a webhook or polling check later.
   */
  startCheckout(params: {
    userId: string;
    packageId: string;
    usdAmount: number;
    reference: string;
  }): Promise<{ paymentUrl: string; reference: string }>;

  /**
   * Confirms whether a given reference has actually settled. Call this
   * from your webhook handler (or a polling job) before crediting coins —
   * exactly the same "never trust the client redirect" rule as Paystack.
   */
  verifyPayment(reference: string): Promise<{ status: "paid" | "pending" | "failed" }>;
}

// Example of how a real implementation would plug in — left unimplemented
// on purpose. Fill this in against your chosen provider's actual, current API.
export class UnconfiguredCryptoProvider implements CryptoCheckoutProvider {
  async startCheckout(): Promise<never> {
    throw new Error(
      "No crypto checkout provider configured yet. Pick a licensed VASP/gateway, " +
        "confirm their current API in their docs, and implement CryptoCheckoutProvider."
    );
  }
  async verifyPayment(): Promise<never> {
    throw new Error("No crypto checkout provider configured yet.");
  }
}

export const cryptoCheckoutProvider: CryptoCheckoutProvider =
  new UnconfiguredCryptoProvider();