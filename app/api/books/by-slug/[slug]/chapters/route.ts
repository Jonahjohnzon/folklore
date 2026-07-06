import { connectToDatabase } from "@/app/api/lib/db/connect";
import { Book } from "@/app/api/lib/models/Book";
import { Chapter } from "@/app/api/lib/models/Chapter";
import { ChapterUnlock } from "@/app/api/lib/models/ChapterUnlock";
import { optionalAuth } from "@/app/api/auth/optionalAuth";
import { ok, fail } from "@/app/api/response";
import { NotFoundError } from "@/app/api/lib/db/errors";

const VISIBLE_STATUSES = ["ongoing", "completed", "hiatus"];

export const GET = optionalAuth(async (req, ctx) => {
  try {
    await connectToDatabase();
    const { slug } = await ctx.params;
    const book = await Book.findOne({ slug, status: { $in: VISIBLE_STATUSES } })
      .select("_id authorId")
      .lean();
    if (!book) throw new NotFoundError("Book not found");

    const userId = req.user?.sub;
    const isAuthor = Boolean(userId && String(book.authorId) === String(userId));

    // Only published chapters show up in the public TOC.
    const chapters = await Chapter.find({ bookId: book._id, publishedAt: { $ne: null } })
      .select("orderIndex title wordCount accessType coinsRequired")
      .sort({ orderIndex: 1 })
      .lean();

    // Figure out which locked chapters this specific viewer has already paid for,
    // in one query rather than N.
    let unlockedIds = new Set<string>();
    if (userId && !isAuthor) {
      const paidChapterIds = chapters
        .filter((c) => c.accessType === "coins" || c.accessType === "purchase")
        .map((c) => c._id);
      if (paidChapterIds.length > 0) {
        const unlocks = await ChapterUnlock.find({ userId, chapterId: { $in: paidChapterIds } })
          .select("chapterId")
          .lean();
        unlockedIds = new Set(unlocks.map((u) => String(u.chapterId)));
      }
    }

    return ok({
      isAuthor,
      chapters: chapters.map((c) => {
        const locked = c.accessType === "coins" || c.accessType === "purchase" || c.accessType === "subscriber_only";
        const bypassed = isAuthor || unlockedIds.has(String(c._id));
        return {
          _id: String(c._id),
          orderIndex: c.orderIndex,
          title: c.title,
          wordCount: c.wordCount,
          accessType: bypassed && locked ? "free" : c.accessType,
          coinsRequired: c.coinsRequired,
          unlocked: bypassed || !locked,
        };
      }),
    });
  } catch (error) {
    return fail(error);
  }
});