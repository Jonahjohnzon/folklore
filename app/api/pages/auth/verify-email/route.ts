// app/api/pages/auth/verify-email/route.ts
// POST rather than GET — keeps the token out of server access logs and lets
// the client-rendered /verify-email page drive the request instead of a
// server redirect chain.
import { NextRequest } from "next/server";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { verifyEmailToken } from "@/app/api/services/auth.service";
import { ok, fail } from "@/app/api/response";
import { ValidationError } from "@/app/api/lib/db/errors";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const { token } = await req.json();
    if (!token || typeof token !== "string") {
      throw new ValidationError("Missing verification token");
    }
    const result = await verifyEmailToken(token);
    return ok(result);
  } catch (error) {
    return fail(error);
  }
}