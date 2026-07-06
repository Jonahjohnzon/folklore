// app/api/admin/users/[userId]/role/route.ts
import { withAdmin } from "@/app/api/admin/withAdmin";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { User } from "@/app/api/lib/models/User";
import { ok, fail } from "@/app/api/response";
import { NotFoundError, ValidationError } from "@/app/api/lib/db/errors";

const ALLOWED = ["user", "moderator", "admin"];

export const PATCH = withAdmin(async (req, ctx) => {
  try {
    await connectToDatabase();
    const { userId } = await ctx.params;
    const { role } = await req.json();
    if (!ALLOWED.includes(role)) throw new ValidationError("Invalid role");

    // Prevent an admin from demoting themselves out of the only admin seat by accident.
    if (req.user.sub === userId && role !== "admin") {
      throw new ValidationError("Cannot change your own admin role here");
    }

    const user = await User.findByIdAndUpdate(userId, { role }, { new: true }).select("username role");
    if (!user) throw new NotFoundError("User not found");

    return ok({ user });
  } catch (error) {
    return fail(error);
  }
});