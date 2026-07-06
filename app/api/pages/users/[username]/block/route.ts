import { withAuth } from "@/app/api/auth/withAuth";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { User } from "@/app/api/lib/models/User";
import { ok, fail } from "@/app/api/response";
import { NotFoundError, ValidationError } from "@/app/api/lib/db/errors";

async function resolveTarget(username: string | string[], requesterId: string) {
  const target = await User.findOne({ username }).select("_id").lean();
  if (!target) throw new NotFoundError("User not found");
  if (target._id.toString() === requesterId) throw new ValidationError("You can't block yourself");
  return target._id;
}

export const POST = withAuth(async (req, ctx) => {
  try {
    await connectToDatabase();
    const { username } = await ctx.params;
    const targetId = await resolveTarget(username, req.user.sub);
    await User.findByIdAndUpdate(req.user.sub, {
      $addToSet: { blockedUsers: targetId },
      $pull: { following: targetId },
    });
    return ok({ blocked: true });
  } catch (error) {
    return fail(error);
  }
});

export const DELETE = withAuth(async (req, ctx) => {
  try {
    await connectToDatabase();
    const { username } = await ctx.params;
    const targetId = await resolveTarget(username, req.user.sub);
    await User.findByIdAndUpdate(req.user.sub, { $pull: { blockedUsers: targetId } });
    return ok({ blocked: false });
  } catch (error) {
    return fail(error);
  }
});