import { connectToDatabase } from "@/app/api/lib/db/connect";
import { User } from "@/app/api/lib/models/User";
import { ok, fail } from "@/app/api/response";
import { optionalAuth } from "../../auth/optionalAuth";

export const GET = optionalAuth(async (req) => {
  try {
    await connectToDatabase();
    if(!req.user)
    {
      return ok({})
    }
    const user = await User.findById(req.user.sub).lean();
    return ok({ coinBalance: user?.coinBalance ?? 0 });
  } catch (error) {
    return fail(error);
  }
});