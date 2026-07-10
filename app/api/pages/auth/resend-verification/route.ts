// app/api/pages/auth/resend-verification/route.ts
import { withAuth } from "@/app/api/auth/withAuth";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { resendVerificationEmail } from "@/app/api/services/auth.service";
import { ok, fail } from "@/app/api/response";

export const POST = withAuth(async (req) => {
  try {
    await connectToDatabase();
    await resendVerificationEmail(req.user.sub);
    return ok({ sent: true });
  } catch (error) {
    return fail(error);
  }
});