// app/api/creator/payout-requests/route.ts
import { z } from "zod";
import { withAuth } from "@/app/api/auth/withAuth";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { PayoutAccount, type PayoutAccountDoc } from "@/app/api/lib/models/PayoutAccount";
import { PayoutRequest } from "@/app/api/lib/models/PayoutRequest";
import { getAvailableBalance, MIN_PAYOUT_COINS } from "@/app/api/lib/payouts/balance";
import { decryptSecret, maskAccountNumber, maskWalletAddress } from "@/app/api/lib/server/payout-crypto";
import { ok, fail } from "@/app/api/response";
import { ValidationError, NotFoundError } from "@/app/api/lib/db/errors";

const bodySchema = z.object({
  amountCoins: z.coerce.number().int().min(1),
});

export const GET = withAuth(async (req) => {
  try {
    await connectToDatabase();
    const [requests, balance] = await Promise.all([
      PayoutRequest.find({ userId: req.user.sub }).sort({ createdAt: -1 }).lean(),
      getAvailableBalance(String(req.user.sub)),
    ]);

    return ok({
      balance: { ...balance, minPayout: MIN_PAYOUT_COINS },
      requests: requests.map((r) => ({
        _id: String(r._id),
        amountCoins: r.amountCoins,
        method: r.method,
        status: r.status,
        adminNote: r.adminNote ?? null,
        createdAt: r.createdAt,
        processedAt: r.processedAt ?? null,
      })),
    });
  } catch (error) {
    return fail(error);
  }
});

export const POST = withAuth(async (req) => {
  try {
    await connectToDatabase();
    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      throw new ValidationError("Invalid request", parsed.error.flatten().fieldErrors);
    }
    const { amountCoins } = parsed.data;
    if (amountCoins < MIN_PAYOUT_COINS) {
      throw new ValidationError("Amount too low", { amountCoins: [`Minimum payout is ${MIN_PAYOUT_COINS} coins.`] });
    }

    const account = await PayoutAccount.findOne({ userId: req.user.sub }).lean<PayoutAccountDoc>();
    if (!account) throw new NotFoundError("Add your payout details before requesting a payout.");
    if (!account.verified) {
      throw new ValidationError("Account not verified", { account: ["Your payout account hasn't been verified yet."] });
    }

    const balance = await getAvailableBalance(String(req.user.sub));
    if (amountCoins > balance.available) {
      throw new ValidationError("Insufficient balance", { amountCoins: [`You only have ${balance.available} coins available.`] });
    }

    const destinationSnapshot =
      account.method === "bank"
        ? {
            bankName: account.bankName,
            accountName: account.accountName,
            accountNumberMasked: account.accountNumberEnc ? maskAccountNumber(decryptSecret(account.accountNumberEnc)) : undefined,
          }
        : {
            cryptoNetwork: account.cryptoNetwork,
            walletAddressMasked: account.walletAddressEnc ? maskWalletAddress(decryptSecret(account.walletAddressEnc)) : undefined,
          };

    const request = await PayoutRequest.create({
      userId: req.user.sub,
      amountCoins,
      method: account.method,
      destinationSnapshot,
      status: "pending",
    });

    return ok({ request: { _id: String(request._id), status: request.status } });
  } catch (error) {
    return fail(error);
  }
});