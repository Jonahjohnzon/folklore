// app/api/creator/payout-requests/[id]/route.ts
import { withAuth } from "@/app/api/auth/withAuth";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { PayoutRequest } from "@/app/api/lib/models/PayoutRequest";
import { ok, fail } from "@/app/api/response";
import { NotFoundError, ValidationError } from "@/app/api/lib/db/errors";

export const DELETE = withAuth(async (req, ctx) => {
  try {
    await connectToDatabase();
    const { id } = await ctx.params;

    const request = await PayoutRequest.findOne({ _id: id, userId: req.user.sub });
    if (!request) throw new NotFoundError("Payout request not found.");

    if (request.status !== "pending") {
      throw new ValidationError(
        "Can't cancel this request",
        { status: [`This request is already ${request.status} — contact support if it needs to change.`] }
      );
    }

    request.status = "cancelled";
    request.processedAt = new Date();
    await request.save();

    return ok({ status: request.status });
  } catch (error) {
    return fail(error);
  }
});