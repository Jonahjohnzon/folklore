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
  console.log(valid)
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