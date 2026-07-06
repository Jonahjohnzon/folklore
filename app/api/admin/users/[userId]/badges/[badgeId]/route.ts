// app/api/admin/users/[userId]/badges/[badgeId]/route.ts — manual revoke
import { withAdmin } from "@/app/api/admin/withAdmin";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { UserBadge } from "@/app/api/lib/models/UserBadge";
import { ok, fail } from "@/app/api/response";

export const DELETE = withAdmin(async (req, ctx) => {
  try {
    await connectToDatabase();
    const { userId, badgeId } = await ctx.params;
    await UserBadge.deleteOne({ userId, badgeId });
    return ok({ revoked: true });
  } catch (error) {
    return fail(error);
  }
});