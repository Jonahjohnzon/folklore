import { connectToDatabase } from "@/app/api/lib/db/connect";
import { User } from "@/app/api/lib/models/User";
import { withAuth } from "@/app/api/auth/withAuth";
import { ok, fail } from "@/app/api/response";
import { comparePassword, hashPassword } from "@/app/api/auth/password";
import { UnauthorizedError, NotFoundError, ValidationError } from "@/app/api/lib/db/errors";

export const POST = withAuth(async (req) => {
  try {
    const { currentPassword, newPassword } = await req.json();
    if (!currentPassword || !newPassword) {
      throw new ValidationError("Both current and new password are required");
    }

    await connectToDatabase();

    const userId = req.user.sub;
    const user = await User.findById(userId).select("+passwordHash");
    if (!user) throw new NotFoundError("User not found");

    const valid = await comparePassword(currentPassword, user.passwordHash);
    if (!valid) throw new UnauthorizedError("Current password is incorrect");

    user.passwordHash = await hashPassword(newPassword);
    await user.save();

    return ok({ changed: true });
  } catch (err) {
    return fail(err);
  }
});