import { withAuth } from "@/app/api/auth/withAuth";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { User } from "@/app/api/lib/models/User";
import { updateUserSchema } from "@/app/api/validation/user.schema";
import { ok, fail } from "@/app/api/response";
import { ValidationError, NotFoundError } from "@/app/api/lib/db/errors";

export const PATCH = withAuth(async (req) => {
  try {
    await connectToDatabase();

    const body = await req.json();
    const parsed = updateUserSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError("Invalid input", parsed.error.flatten().fieldErrors);
    }

    const user = await User.findByIdAndUpdate(
      req.user.sub,
      { $set: parsed.data },
      { new: true }
    );

    if (!user) throw new NotFoundError("User not found");

    const { passwordHash, ...safeUser } = user.toObject();
    return ok({ user: safeUser });
  } catch (error) {
    return fail(error);
  }
});