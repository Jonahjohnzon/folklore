// app/api/pages/reviews/eligibility/route.ts — lets the UI show/hide the composer before submit
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { hasEliteBadge } from "@/app/api/lib/reviews/badge-gate";
import { ok, fail } from "@/app/api/response";
import { optionalAuth } from "@/app/api/auth/optionalAuth";

export const GET = optionalAuth(async (req) => {
  try {
    await connectToDatabase();
    if (!req.user) {
      return ok({ eligible: false });
    }
    const eligible = await hasEliteBadge(req.user.sub);
    return ok({ eligible });
  } catch (error) {
    return fail(error);
  }
});