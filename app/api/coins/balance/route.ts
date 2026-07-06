import { withAuth } from "@/app/api/auth/withAuth";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { User } from "@/app/api/lib/models/User";
import { ok, fail } from "@/app/api/response";

export const GET = withAuth(async (req) => {
  try {
    await connectToDatabase();
    const user = await User.findById(req.user.sub).lean();
    return ok({ coinBalance: user?.coinBalance ?? 0 });
  } catch (error) {
    return fail(error);
  }
});