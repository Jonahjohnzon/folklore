import { User, type IUser } from "@/app/api/lib/models/User";
import { hashPassword, comparePassword } from "@/app/api/auth/password";
import { signAuthToken } from "@/app/api/auth/jwt";
import { ConflictError, UnauthorizedError, NotFoundError, ValidationError } from "@/app/api/lib/db/errors";
import type { RegisterInput, LoginInput } from "@/app/api/validation/auth.schema";
import { Types } from "mongoose";
import * as templates from "@/app/api/lib/email/templates";
import { sendEmail } from "@/app/api/lib/email/send";
import { generateVerificationToken, hashVerificationToken } from "@/app/api/lib/auth/email-verification";
export type SafeUser = Omit<IUser, "passwordHash">;

function toSafeUser(user: IUser): SafeUser {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...safe } = user;
  return safe;
}

async function generateUniqueUsername(base: string): Promise<string> {
  const cleaned = base.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20) || "user";
  let candidate = cleaned;
  let suffix = 0;
  // eslint-disable-next-line no-await-in-loop
  while (await User.exists({ username: candidate })) {
    suffix += 1;
    candidate = `${cleaned}${suffix}`;
  }
  return candidate;
}

export async function registerUser(input: RegisterInput) {
  const existing = await User.findOne({
    $or: [{ email: input.email }, { username: input.username }],
  }).lean();

  if (existing) {
    const field = existing.email === input.email ? "email" : "username";
    throw new ConflictError(`This ${field} is already taken`);
  }

  const passwordHash = await hashPassword(input.password);

  const user = await User.create({
    email: input.email,
    username: input.username,
    passwordHash,
    displayName: input.displayName,
    dateOfBirth: new Date(input.dateOfBirth),
    marketingOptIn: input.marketingOptIn ?? false,
    termsAcceptedAt: new Date(),
    matureContentEnabled: false,
  });

  const token = await signAuthToken({
    sub: user._id.toString(),
    email: user.email,
    activeMode: user.activeMode,
  });
  sendVerificationEmail(user).catch((err) =>
    console.error("Failed to send verification email on register:", err)
  );

  return { user: toSafeUser(user.toObject()), token };
}

export async function loginUser(input: LoginInput) {
  const user = await User.findOne({
    $or: [{ email: input.identifier.toLowerCase() }, { username: input.identifier }],
  });

 
  if (!user) {
    throw new UnauthorizedError("Invalid email/username or password");
  }

  if (user.status !== 'active') {
    throw new UnauthorizedError("This account is not active");
  }

   
  const valid = await comparePassword(input.password, user.passwordHash);
  if (!valid) {
    throw new UnauthorizedError("Invalid email/username or password");
  }


  const token = await signAuthToken({   // ← add this
    sub: user._id.toString(),
    email: user.email,
    activeMode: user.activeMode,
  });

  return { user: toSafeUser(user.toObject()), token };
}

export async function loginOrRegisterWithGoogle(identity: {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
}) {
  let user = await User.findOne({ googleId: identity.sub });

  if (!user) {
    // Link to an existing password/email account if the email matches
    user = await User.findOne({ email: identity.email.toLowerCase() });
    if (user) {
      user.googleId = identity.sub;
      if (!user.authProviders?.includes("google")) {
        user.authProviders = [...(user.authProviders ?? []), "google"];
      }
      await user.save();
    }
  }

  if (!user) {
    const username = await generateUniqueUsername(identity.email.split("@")[0]);
    user = await User.create({
      email: identity.email.toLowerCase(),
      username,
      googleId: identity.sub,
      displayName: identity.name,
      avatarUrl: identity.picture,
      authProviders: ["google"],
      termsAcceptedAt: new Date(),
      matureContentEnabled: false,
      status: "active",
      // dateOfBirth intentionally omitted — collect this post-signup if you enforce a min age
    });
  }

  if (user.status !== "active") {
    throw new UnauthorizedError("This account is not active");
  }

  const token = await signAuthToken({
    sub: user._id.toString(),
    email: user.email,
    activeMode: user.activeMode,
  });

  return { user: toSafeUser(user.toObject()), token };
}

async function sendVerificationEmail(user: {
  _id: Types.ObjectId;
  email: string;
  username: string;
  displayName?: string;
}) {
  const { token, tokenHash, expiresAt } = generateVerificationToken();

  await User.updateOne(
    { _id: user._id },
    {
      emailVerificationTokenHash: tokenHash,
      emailVerificationExpires: expiresAt,
      emailVerificationLastSentAt: new Date(),
    }
  );

  const verifyUrl = `${process.env.APP_URL ?? "https://tipatale.com"}/verify-email?token=${token}`;
  const { subject, html, text } = templates.verifyEmailTemplate({
    displayName: user.displayName || user.username,
    verifyUrl,
  });

  await sendEmail({ to: user.email, subject, html, text });
}

const RESEND_COOLDOWN_MS = 60 * 1000;

export async function resendVerificationEmail(userId: string) {
  const user = await User.findById(userId)
    .select("email username displayName emailVerified emailVerificationLastSentAt")
    .lean();
  if (!user) throw new NotFoundError("User not found");
  if (user.emailVerified) throw new ValidationError("Email is already verified");
  if (user.emailVerificationLastSentAt) {
    const elapsed = Date.now() - new Date(user.emailVerificationLastSentAt).getTime();
    if (elapsed < RESEND_COOLDOWN_MS) {
      const wait = Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000);
      throw new ValidationError(`Please wait ${wait}s before requesting another email`);
    }
  }

  await sendVerificationEmail(user);
}

export async function verifyEmailToken(token: string) {
  const tokenHash = hashVerificationToken(token);

  const user = await User.findOne({
    emailVerificationTokenHash: tokenHash,
    emailVerificationExpires: { $gt: new Date() },
  }).select("_id emailVerified emailVerificationTokenHash emailVerificationExpires");

  if (!user) throw new ValidationError("This verification link is invalid or has expired");

  user.emailVerified = true;
  user.emailVerificationTokenHash = null;
  user.emailVerificationExpires = null;
  await user.save();

  return { verified: true };
}