// app/api/pages/auth/reset-password/route.ts
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { resetPassword } from "@/app/api/services/auth.service";
import { resetPasswordSchema } from "@/app/api/validation/auth.schema";
import { ok, fail } from "@/app/api/response";

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = resetPasswordSchema.parse(await req.json());
    const result = await resetPassword(body);
    return ok(result);
  } catch (error) {
    return fail(error);
  }
}