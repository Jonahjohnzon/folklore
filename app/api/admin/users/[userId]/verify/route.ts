// app/api/admin/users/[userId]/verify/route.ts
import { withAdmin } from "@/app/api/admin/withAdmin";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { User } from "@/app/api/lib/models/User";
import { ok, fail } from "@/app/api/response";
import { NotFoundError, ValidationError } from "@/app/api/lib/db/errors";

export const PATCH = withAdmin(async (req, ctx) => {
  try {
    await connectToDatabase();
    const { userId } = await ctx.params;
    const { verified } = await req.json();
    if (typeof verified !== "boolean") throw new ValidationError("verified must be a boolean");

    const user = await User.findByIdAndUpdate(userId, { verifiedAuthor: verified }, { new: true })
      .select("username verifiedAuthor");
    if (!user) throw new NotFoundError("User not found");

    return ok({ user });
  } catch (error) {
    return fail(error);
  }
});