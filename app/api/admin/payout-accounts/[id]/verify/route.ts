// app/api/admin/payout-accounts/[id]/verify/route.ts
import { withAdmin } from "@/app/api/admin/withAdmin";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { PayoutAccount } from "@/app/api/lib/models/PayoutAccount";
import { ok, fail } from "@/app/api/response";

export const PATCH = withAdmin(async (req, ctx) => {
  try {
    await connectToDatabase();
    const {id} = await ctx.params
    const { verified } = await req.json();
    const acct = await PayoutAccount.findByIdAndUpdate(id, { verified: Boolean(verified) }, { new: true });
    if (!acct) return fail(new Error("Payout account not found."));
    return ok({ verified: acct.verified });
  } catch (error) {
    return fail(error);
  }
});