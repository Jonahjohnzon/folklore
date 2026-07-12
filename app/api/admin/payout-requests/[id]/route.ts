// app/api/admin/payout-requests/[id]/route.ts
import { z } from "zod";
import { withAdmin } from "@/app/api/admin/withAdmin";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { PayoutRequest } from "@/app/api/lib/models/PayoutRequest";
import { User } from "@/app/api/lib/models/User";
import { ok, fail } from "@/app/api/response";
import { ValidationError, NotFoundError } from "@/app/api/lib/db/errors";

const bodySchema = z.object({
  status: z.enum(["approved", "paid", "rejected"]),
  adminNote: z.string().trim().max(500).optional(),
});

export const PATCH = withAdmin(async (req, ctx) => {
  try {
    await connectToDatabase();
    const { id } = await ctx.params;
    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      throw new ValidationError("Invalid request", parsed.error.flatten().fieldErrors);
    }

    // Fetch first — we need to know the *previous* status before overwriting
    // it, so a request already marked "paid" can't be re-submitted and
    // debit the creator's balance a second time.
    const existing = await PayoutRequest.findById(id);
    if (!existing) throw new NotFoundError("Payout request not found.");

    const wasAlreadyPaid = existing.status === "paid";

    existing.status = parsed.data.status;
    existing.adminNote = parsed.data.adminNote ?? null;
    existing.processedBy = req.user.sub;
    existing.processedAt = new Date();
    await existing.save();

    if (parsed.data.status === "paid" && !wasAlreadyPaid) {
      // Debit the same coinBalance field CoinService.getBalance() reads,
      // now that the payout has actually been sent.
      await User.findByIdAndUpdate(existing.userId, { $inc: { coinBalance: -existing.amountCoins } });
    }

    return ok({ status: existing.status });
  } catch (error) {
    return fail(error);
  }
});