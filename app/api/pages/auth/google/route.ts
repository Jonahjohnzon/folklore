// app/api/pages/auth/google/route.ts
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { verifyGoogleIdToken } from "@/app/api/lib/auth/google";
import { loginOrRegisterWithGoogle } from "@/app/api/services/auth.service";
import { setAuthCookie } from "@/app/api/auth/cookies";
import { ok, fail } from "@/app/api/response";
import { UnauthorizedError } from "@/app/api/lib/db/errors";

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { idToken } = await req.json();
    if (!idToken) throw new UnauthorizedError("Missing idToken");

    const identity = await verifyGoogleIdToken(idToken);
    const { user, token } = await loginOrRegisterWithGoogle(identity);

    await setAuthCookie(token);
    return ok({ user });
  } catch (error) {
    return fail(error);
  }
}