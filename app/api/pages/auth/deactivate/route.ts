import { connectToDatabase } from "@/app/api/lib/db/connect";
import { User } from "@/app/api/lib/models/User";
import { withAuth } from "@/app/api/auth/withAuth";
import { ok, fail } from "@/app/api/response";
import { NotFoundError } from "@/app/api/lib/db/errors";

export const POST = withAuth(async (req) => {
  try {
    await connectToDatabase();

    const userId = req.user.sub;
    const user = await User.findByIdAndUpdate(userId, { status: "suspended" });
    if (!user) throw new NotFoundError("User not found");

    return ok({ deactivated: true });
  } catch (err) {
    return fail(err);
  }
});