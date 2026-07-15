// app/api/follows/route.ts
import { withAuth } from "@/app/api/auth/withAuth";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { Follow } from "@/app/api/lib/models/Follow";
import { User } from "@/app/api/lib/models/User";
import { ok, fail } from "@/app/api/response";
import { dispatchNotification } from "@/app/api/lib/notifications/dispatch";

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

    // --- notification dispatch (site-only, no email) ---
    // only fires for author follows, and never for following yourself
    if (targetType === "author" && String(targetId) !== String(req.user.sub)) {
      const follower = await User.findById(req.user.sub).select("name username").lean();
      const actorName = follower?.username || "Someone";

      await dispatchNotification({
        userId: targetId,
        type: "new_follower",
        actorId: req.user.sub,
        message: `${actorName} started following you`,
        link: `/${follower?.username ?? ""}`,
        // no `email` field -> in-app notification only, no email sent
      });
    }

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