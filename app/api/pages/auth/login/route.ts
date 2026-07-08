
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { loginSchema } from "@/app/api/validation/auth.schema";
import { loginUser } from "@/app/api/services/auth.service";
import { setAuthCookie } from "@/app/api/auth/cookies";
import { ok, fail } from "@/app/api/response";
import { ValidationError } from "@/app/api/lib/db/errors";

export async function POST(req: Request) {
  try {
    await connectToDatabase();
     const body = await req.json();
  
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError("Invalid input", parsed.error.flatten().fieldErrors);
    }

    const { user, token } = await loginUser(parsed.data);
    await setAuthCookie(token);
    return ok({ user });
  } catch (error) {
    return fail(error);
  }
}