import { connectToDatabase } from "@/app/api/lib/db/connect";
import { User } from "@/app/api/lib/models/User";
import { withAuth } from "@/app/api/auth/withAuth";
import { ok, fail } from "@/app/api/response";
import { ConflictError, ValidationError, NotFoundError } from "@/app/api/lib/db/errors";
import { sendEmail } from "@/app/api/lib/email/send";
import { SignJWT } from "jose";
import { verifyEmailChangeTemplate } from "@/app/api/lib/email/templates";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
const EMAIL_CHANGE_COOLDOWN_MS = 90 * 24 * 60 * 60 * 1000; // 90 days

export const POST = withAuth(async (req) => {
  try {
    const { email } = await req.json();
    if (!email) throw new ValidationError("Email is required");

    await connectToDatabase();

    const userId = req.user.sub;

    const user = await User.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    if (email === user.email) {
      throw new ValidationError("This is already your current email");
    }

    if (user.emailChangedAt) {
      const elapsed = Date.now() - user.emailChangedAt.getTime();
      if (elapsed < EMAIL_CHANGE_COOLDOWN_MS) {
        const daysLeft = Math.ceil((EMAIL_CHANGE_COOLDOWN_MS - elapsed) / (24 * 60 * 60 * 1000));
        throw new ValidationError(
          `You can change your email again in ${daysLeft} day${daysLeft === 1 ? "" : "s"}.`
        );
      }
    }

    const existing = await User.findOne({ email });
    if (existing) throw new ConflictError("Email already in use");

    const token = await new SignJWT({ userId, newEmail: email })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(JWT_SECRET);

    const verifyUrl = `${process.env.APP_URL}/verify-email-change?token=${token}`;

    const { subject, html, text } = verifyEmailChangeTemplate({
      displayName: user.displayName ?? user.username,
      verifyUrl,
    });

    await sendEmail({ to: email, subject, html, text });

    return ok({ sent: true });
  } catch (err) {
    return fail(err);
  }
});