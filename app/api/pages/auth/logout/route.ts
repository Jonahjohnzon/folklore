import { clearAuthCookie } from "@/app/api/auth/cookies";
import { ok, fail } from "@/app/api/response";

export async function POST() {
  try {
    await clearAuthCookie();
    return ok({ message: "Logged out" });
  } catch (error) {
    return fail(error);
  }
}