// app/api/admin/payout-accounts/[id]/reveal/route.ts
import { withAdmin } from "@/app/api/admin/withAdmin";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { PayoutAccount, type PayoutAccountDoc } from "@/app/api/lib/models/PayoutAccount";
import { decryptSecret } from "@/app/api/lib/server/payout-crypto";
import { ok, fail } from "@/app/api/response";

export const GET = withAdmin(async (_req, ctx) => {
  try {
    const {id} = await ctx.params
    await connectToDatabase();
    const acct = await PayoutAccount.findById(id).lean<PayoutAccountDoc>();
    if (!acct) return fail(new Error("Payout account not found."));

    // Worth logging (adminId, accountId, timestamp) to an audit collection —
    // reveals of raw bank/wallet details should be traceable to who did it and when.

    return ok({
      accountNumber: acct.accountNumberEnc ? decryptSecret(acct.accountNumberEnc) : null,
      walletAddress: acct.walletAddressEnc ? decryptSecret(acct.walletAddressEnc) : null,
    });
  } catch (error) {
    return fail(error);
  }
});