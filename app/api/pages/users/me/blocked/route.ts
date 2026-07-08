import { withAuth } from "@/app/api/auth/withAuth";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { User } from "@/app/api/lib/models/User";
import { ok, fail } from "@/app/api/response";
import { NotFoundError } from "@/app/api/lib/db/errors";

export const GET = withAuth(async (req) => {
  try {
    await connectToDatabase();

    const user = await User.findById(req.user.sub)
      .populate("blockedUsers", "username displayName avatarUrl")
      .lean();

    if (!user) throw new NotFoundError("User not found");

    return ok({ users: user.blockedUsers ?? [] });
  } catch (error) {
    return fail(error);
  }
});