// app/api/admin/users/[userId]/badges/route.ts — manual award
import { withAdmin } from "@/app/api/admin/withAdmin";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { UserBadge } from "@/app/api/lib/models/UserBadge";
import { Badge } from "@/app/api/lib/models/Badge";
import { ok, fail } from "@/app/api/response";
import { NotFoundError, ValidationError } from "@/app/api/lib/db/errors";

export const POST = withAdmin(async (req, ctx) => {
  try {
    await connectToDatabase();
    const { userId } = await ctx.params;
    const { badgeId } = await req.json();
    if (!badgeId) throw new ValidationError("badgeId is required");

    const badge = await Badge.findById(badgeId);
    if (!badge) throw new NotFoundError("Badge not found");

    await UserBadge.updateOne(
      { userId, badgeId },
      { $setOnInsert: { userId, badgeId } },
      { upsert: true }
    );

    return ok({ awarded: true });
  } catch (error) {
    return fail(error);
  }
});