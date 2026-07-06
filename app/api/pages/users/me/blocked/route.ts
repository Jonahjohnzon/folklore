import { connectToDatabase } from "@/app/api/lib/db/connect";
import { User } from "@/app/api/lib/models/User";
import { withAuth } from "@/app/api/auth/withAuth";
import { ok, fail } from "@/app/api/response";
import { NotFoundError } from "@/app/api/lib/db/errors";

export const GET = withAuth(async (req) => {
  try {
    await connectToDatabase();

    const userId = req.user.sub;
    const user = await User.findById(userId).populate("blockedUsers", "username displayName avatarUrl");
    if (!user) throw new NotFoundError("User not found");

    return ok({ users: user.blockedUsers ?? [] });
  } catch (err) {
    return fail(err);
  }
});