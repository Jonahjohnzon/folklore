// app/api/follows/route.ts
import { withAuth } from "@/app/api/auth/withAuth";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { Follow } from "@/app/api/lib/models/Follow";
import { ok, fail } from "@/app/api/response";

// POST — follow a book or author
export const POST = withAuth(async (req) => {
  try {
    await connectToDatabase();
    const { targetType, targetId } = await req.json();
    if (!["book", "author"].includes(targetType) || !targetId) {
      return fail("Invalid follow target");
    }

    const doc =
      targetType === "book"
        ? { followerId: req.user.sub, targetType, bookId: targetId }
        : { followerId: req.user.sub, targetType, authorId: targetId };

    // upsert avoids duplicate-key errors on double-clicks
    await Follow.findOneAndUpdate(doc, doc, { upsert: true });
    return ok({ following: true });
  } catch (error) {
    return fail(error);
  }
});

// app/api/follows/route.ts — change DELETE to read from searchParams instead of body
export const DELETE = withAuth(async (req) => {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const targetType = searchParams.get("targetType");
    const targetId = searchParams.get("targetId");
    if (!["book", "author"].includes(targetType ?? "") || !targetId) {
      return fail("Invalid follow target");
    }

    const filter =
      targetType === "book"
        ? { followerId: req.user.sub, targetType, bookId: targetId }
        : { followerId: req.user.sub, targetType, authorId: targetId };

    await Follow.deleteOne(filter);
    return ok({ following: false });
  } catch (error) {
    return fail(error);
  }
});