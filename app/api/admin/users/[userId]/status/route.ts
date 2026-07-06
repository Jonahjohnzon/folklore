// app/api/admin/users/[userId]/status/route.ts — ban/suspend/unban
import { withAdmin } from "@/app/api/admin/withAdmin";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { User } from "@/app/api/lib/models/User";
import { ok, fail } from "@/app/api/response";
import { NotFoundError, ValidationError } from "@/app/api/lib/db/errors";

const ALLOWED = ["active", "suspended", "deleted"];

export const PATCH = withAdmin(async (req, ctx) => {
  try {
    await connectToDatabase();
    const { userId } = await ctx.params;
    const { status } = await req.json();
    if (!ALLOWED.includes(status)) throw new ValidationError("Invalid status");

    const user = await User.findByIdAndUpdate(userId, { status }, { new: true }).select("username status");
    if (!user) throw new NotFoundError("User not found");

    return ok({ user });
  } catch (error) {
    return fail(error);
  }
});