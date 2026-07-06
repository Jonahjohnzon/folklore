import { withAuth } from "@/app/api/auth/withAuth";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { User } from "@/app/api/lib/models/User";
import { creatorApplySchema } from "@/app/api/validation/user.schema";
import { ok, fail } from "@/app/api/response";
import { ValidationError, NotFoundError, ConflictError } from "@/app/api/lib/db/errors";

export const POST = withAuth(async (req) => {
  try {
    await connectToDatabase();

    const existing = await User.findById(req.user.sub).lean();
    if (!existing) throw new NotFoundError("User not found");
    if (existing.creatorStatus === "active") {
      throw new ConflictError("You're already a creator");
    }

    const body = await req.json();
    const parsed = creatorApplySchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError("Invalid input", parsed.error.flatten().fieldErrors);
    }

    const user = await User.findByIdAndUpdate(
      req.user.sub,
      {
        $set: {
          penName: parsed.data.penName,
          ...(parsed.data.bio ? { bio: parsed.data.bio } : {}),
          creatorStatus: "active", // instant approval, no review queue
          creatorActivatedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!user) throw new NotFoundError("User not found");

    const { passwordHash, ...safeUser } = user.toObject();
    return ok({ user: safeUser });
  } catch (error) {
    return fail(error);
  }
});