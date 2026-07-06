import { connectToDatabase } from "@/app/api/lib/db/connect";
import {optionalAuth, type OptionallyAuthedRequest } from "@/app/api/auth/optionalAuth";
import { User } from "@/app/api/lib/models/User";
import { ok, fail } from "@/app/api/response";
import { NotFoundError } from "@/app/api/lib/db/errors";


export const GET = optionalAuth(async (req: OptionallyAuthedRequest) => {
  try {
    await connectToDatabase();
// Log the body to see its structure
    if (!req.user) {
      return ok({ user: null });
    }
  
    const user = await User.findById(req.user.sub).select("-passwordHash").lean();
    if (!user) {
      return ok(null);
    }

    return ok({ user });
  } catch (error) {
    return fail(error);
  }
});