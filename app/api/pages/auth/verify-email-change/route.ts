// app/api/pages/auth/verify-email-change/route.ts
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { User } from "@/app/api/lib/models/User";
import { ok, fail } from "@/app/api/response";
import { ValidationError, ConflictError, NotFoundError } from "@/app/api/lib/db/errors";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export const POST = async (req: Request) => {
  try {
    const { token } = await req.json();
    if (!token) throw new ValidationError("Token is required");

    await connectToDatabase();

    let payload: { userId?: string; newEmail?: string };
    try {
      const result = await jwtVerify(token, JWT_SECRET);
      payload = result.payload as { userId: string; newEmail: string };
    } catch {
      throw new ValidationError("This link is invalid or has expired");
    }

    const { userId, newEmail } = payload;
    if (!userId || !newEmail) throw new ValidationError("Malformed token");

    // someone else may have claimed this email in the hour since the link was sent
    const existing = await User.findOne({ email: newEmail, _id: { $ne: userId } });
    if (existing) throw new ConflictError("Email already in use");

    const user = await User.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    user.email = newEmail;
    user.emailVerified = true; // clicking the link proves ownership of the new address
    await user.save();

    return ok({ verified: true, email: user.email });
  } catch (err) {
    return fail(err);
  }
};