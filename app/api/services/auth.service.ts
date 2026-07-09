import { User, type IUser } from "@/app/api/lib/models/User";
import { hashPassword, comparePassword } from "@/app/api/auth/password";
import { signAuthToken } from "@/app/api/auth/jwt";
import { ConflictError, UnauthorizedError } from "@/app/api/lib/db/errors";
import type { RegisterInput, LoginInput } from "@/app/api/validation/auth.schema";

export type SafeUser = Omit<IUser, "passwordHash">;

function toSafeUser(user: IUser): SafeUser {
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