import { NextRequest } from "next/server";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { registerSchema } from "@/app/api/validation/auth.schema";
import { registerUser } from "@/app/api/services/auth.service";
import { setAuthCookie } from "@/app/api/auth/cookies";
import { created, fail } from "@/app/api/response";
import { ValidationError } from "@/app/api/lib/db/errors";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError("Invalid input", parsed.error.flatten().fieldErrors);
    }

    const { user, token } = await registerUser(parsed.data);

    await setAuthCookie(token);
    return created({ user });
  } catch (error) {
    return fail(error);
  }
}