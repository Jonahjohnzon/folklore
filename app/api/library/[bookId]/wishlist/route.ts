// POST /api/library/[bookId]/wishlist/route.ts
import { withAuth } from "@/app/api/auth/withAuth";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { LibraryEntry } from "@/app/api/lib/models/LibraryEntry";
import { ok, fail } from "@/app/api/response";
import { optionalAuth } from "@/app/api/auth/optionalAuth";

export const POST = withAuth(async (req, ctx) => {
  try {
    await connectToDatabase();
    const { bookId } = await ctx.params;
    const userId = req.user.sub;
    const now = new Date();

    const existing = await LibraryEntry.findOne({ userId, bookId });

    if (!existing) {
      await LibraryEntry.create({ userId, bookId, status: "want_to_read", addedAt: now, lastActivityAt: now });
      return ok({ status: "want_to_read" });
    }

    if (existing.status === "want_to_read") {
      await LibraryEntry.deleteOne({ _id: existing._id });
      return ok({ status: null });
    }

    // Already reading/completed/dropped — the wishlist button shouldn't
    // downgrade a book they've actually engaged with. No-op.
    return ok({ status: existing.status });
  } catch (error) {
    return fail(error);
  }
});


export const GET = optionalAuth(async (req, ctx) => {
  try {
    await connectToDatabase();
    const { bookId } = await ctx.params;
    if (!req.user?.sub) return ok({ status: null });

    const entry = await LibraryEntry.findOne({ userId: req.user.sub, bookId }).select("status").lean();
    return ok({ status: entry?.status ?? null });
  } catch (error) {
    return fail(error);
  }
});