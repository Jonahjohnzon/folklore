// app/api/creator/payout-account/route.ts
import { z } from "zod";
import { withAuth } from "@/app/api/auth/withAuth";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { PayoutAccount, type PayoutAccountDoc } from "@/app/api/lib/models/PayoutAccount";
import { encryptSecret, decryptSecret, maskAccountNumber, maskWalletAddress } from "@/app/api/lib/server/payout-crypto";
import { ok, fail } from "@/app/api/response";
import { ValidationError } from "@/app/api/lib/db/errors";

const bankSchema = z.object({
  method: z.literal("bank"),
  bankName: z.string().trim().min(2),
  bankCode: z.string().trim().optional(),
  accountNumber: z.string().trim().regex(/^\d{10}$/, "Nigerian account numbers are 10 digits (NUBAN)."),
  accountName: z.string().trim().min(2),
});

const cryptoSchema = z.object({
  method: z.literal("crypto"),
  cryptoNetwork: z.string().trim().min(2),
  walletAddress: z.string().trim().min(20).max(128),
});

const bodySchema = z.discriminatedUnion("method", [bankSchema, cryptoSchema]);

export const GET = withAuth(async (req) => {
  try {
    await connectToDatabase();
    const acct = await PayoutAccount.findOne({ userId: req.user.sub }).lean<PayoutAccountDoc>();
    if (!acct) return ok({ account: null });

    return ok({
      account: {
        method: acct.method,
        bankName: acct.bankName ?? null,
        accountName: acct.accountName ?? null,
        accountNumberMasked: acct.accountNumberEnc ? maskAccountNumber(decryptSecret(acct.accountNumberEnc)) : null,
        cryptoNetwork: acct.cryptoNetwork ?? null,
        walletAddressMasked: acct.walletAddressEnc ? maskWalletAddress(decryptSecret(acct.walletAddressEnc)) : null,
        verified: acct.verified,
        updatedAt: acct.updatedAt,
      },
    });
  } catch (error) {
    return fail(error);
  }
});

export const PUT = withAuth(async (req) => {
  try {
    await connectToDatabase();
    const body = await req.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError("Invalid payout details", parsed.error.flatten().fieldErrors);
    }

    const update: Record<string, unknown> = {
      method: parsed.data.method,
      verified: false,
    };

    if (parsed.data.method === "bank") {
      update.bankName = parsed.data.bankName;
      update.bankCode = parsed.data.bankCode ?? null;
      update.accountName = parsed.data.accountName;
      update.accountNumberEnc = encryptSecret(parsed.data.accountNumber);
      update.cryptoNetwork = null;
      update.walletAddressEnc = null;
    } else {
      update.cryptoNetwork = parsed.data.cryptoNetwork;
      update.walletAddressEnc = encryptSecret(parsed.data.walletAddress);
      update.bankName = null;
      update.bankCode = null;
      update.accountName = null;
      update.accountNumberEnc = null;
    }

    await PayoutAccount.findOneAndUpdate(
      { userId: req.user.sub },
      update,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return ok({ saved: true, verified: false });
  } catch (error) {
    return fail(error);
  }
});