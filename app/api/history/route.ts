// GET /api/reading-history/route.ts
import { withAuth } from "@/app/api/auth/withAuth";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { ReadingProgress } from "@/app/api/lib/models/ReadingProgress";
import { ok, fail } from "@/app/api/response";
import { Types } from "mongoose";

const MAX_ENTRIES = 200;

export const GET = withAuth(async (req) => {
  try {
    await connectToDatabase();

    const entries = await ReadingProgress.aggregate([
      { $match: { userId: new Types.ObjectId(req.user.sub) } },
      { $sort: { chapterOrderIndex: -1 } },
      {
        $group: {
          _id: "$bookId",
          chapterId: { $first: "$chapterId" },
          chapterOrderIndex: { $first: "$chapterOrderIndex" },
          chapterTitle: { $first: "$chapterTitle" },
          bookTitle: { $first: "$bookTitle" },
          bookSlug: { $first: "$bookSlug" },
          bookCoverUrl: { $first: "$bookCoverUrl" },
          progressPct: { $first: "$progressPct" },
          completed: { $first: "$completed" },
          lastReadAt: { $max: "$lastReadAt" },
        },
      },
      // Pull totalChapters live from Book instead of denormalizing it.
      {
        $lookup: {
          from: "books", // check this matches your actual collection name
          localField: "_id", // this is bookId, from the $group above
          foreignField: "_id",
          as: "bookDoc",
        },
      },
      { $unwind: { path: "$bookDoc", preserveNullAndEmptyArrays: true } },
      { $sort: { lastReadAt: -1 } },
      { $limit: MAX_ENTRIES },
    ]);

    return ok({
      entries: entries.map((e) => {
        const totalChapters = e.bookDoc?.totalChapters ?? 0;
        return {
          chapterId: String(e.chapterId),
          chapterOrderIndex: e.chapterOrderIndex,
          chapterTitle: e.chapterTitle,
          chapterProgressPct: e.progressPct,
          bookProgressPct:
            totalChapters > 0
              ? Math.round(((e.chapterOrderIndex) / totalChapters) * 100) // remove +1 if orderIndex is 1-based
              : 0,
          completed: e.completed,
          lastReadAt: e.lastReadAt,
          book: {
            slug: e.bookSlug,
            title: e.bookTitle,
            coverUrl: e.bookCoverUrl,
          },
        };
      }),
    });
  } catch (error) {
    return fail(error);
  }
});