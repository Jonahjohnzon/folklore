// app/api/pages/auth/username-available/route.ts
import { NextRequest } from "next/server";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { User } from "@/app/api/lib/models/User";
import { ok, fail } from "@/app/api/response";
import { ValidationError } from "@/app/api/lib/db/errors";

const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;

export async function GET(req: NextRequest) {
  try {
    const username = req.nextUrl.searchParams.get("username")?.trim() ?? "";

    if (username.length < 3 || username.length > 30 || !USERNAME_REGEX.test(username)) {
      throw new ValidationError("Invalid username format");
    }

    await connectToDatabase();

    const existing = await User.exists({ username });

    return ok({ available: !existing });
  } catch (error) {
    return fail(error);
  }
}