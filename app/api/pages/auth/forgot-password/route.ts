// app/api/pages/auth/forgot-password/route.ts
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { forgotPassword } from "@/app/api/services/auth.service";
import { forgotPasswordSchema } from "@/app/api/validation/auth.schema";
import { ok, fail } from "@/app/api/response";

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = forgotPasswordSchema.parse(await req.json());
    const result = await forgotPassword(body);
    return ok(result);
  } catch (error) {
    return fail(error);
  }
}