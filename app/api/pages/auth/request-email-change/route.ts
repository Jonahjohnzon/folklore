import { connectToDatabase } from "@/app/api/lib/db/connect";
import { User } from "@/app/api/lib/models/User";
import { withAuth } from "@/app/api/auth/withAuth";
import { ok, fail } from "@/app/api/response";
import { ConflictError, ValidationError } from "@/app/api/lib/db/errors";
import { sendEmail } from "@/app/api/lib/email/send";
import { SignJWT } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export const POST = withAuth(async (req) => {
  try {
    const { email } = await req.json();
    if (!email) throw new ValidationError("Email is required");

    await connectToDatabase();

    const existing = await User.findOne({ email });
    if (existing) throw new ConflictError("Email already in use");

    const userId = req.user.sub;
    const token = await new SignJWT({ userId, newEmail: email })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(JWT_SECRET);

    const verifyUrl = `${process.env.APP_URL}/verify-email-change?token=${token}`;

    await sendEmail({
      to: email,
      subject: "Confirm your new email",
      html: `<p>Click the link below to confirm your new email address:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p><p>This link expires in 1 hour.</p>`,
      text: `Confirm your new email address: ${verifyUrl}\n\nThis link expires in 1 hour.`,
    });

    return ok({ sent: true });
  } catch (err) {
    return fail(err);
  }
});