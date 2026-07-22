import { connectToDatabase } from "@/app/api/lib/db/connect";
import { Chapter } from "@/app/api/lib/models/Chapter";
import { ChapterLike } from "@/app/api/lib/models/ChapterLike";
import { withAuth } from "@/app/api/auth/withAuth";
import { dispatchNotification } from "@/app/api/lib/notifications/dispatch";
import { ok, fail } from "@/app/api/response";

const LIKE_MILESTONES = [10, 50, 100, 500, 1000, 5000, 10000];

export const GET = withAuth(async (req, ctx) => {
  await connectToDatabase();
  const { chapterId } = await ctx.params;
  if (!chapterId) return fail("Invalid chapter id");

  const userId = req.user?.sub;
  const [likesCount, existingLike] = await Promise.all([
    ChapterLike.countDocuments({ chapterId }),
    userId ? ChapterLike.exists({ chapterId, userId }) : null,
  ]);
  return ok({ liked: Boolean(existingLike), likesCount: likesCount || 0 });
});

export const POST = withAuth(async (req, ctx) => {
  await connectToDatabase();
   const { chapterId: rawChapterId } = await ctx.params;
    const chapterId = Array.isArray(rawChapterId) ? rawChapterId[0] : rawChapterId;
    if (!chapterId) return fail("Invalid chapter id");

  const userId = req.user?.sub;
  if (!userId) return fail("Sign in required");

  try {
    await ChapterLike.create({ chapterId, userId });
    const chapter = await Chapter.findByIdAndUpdate(
      chapterId,
      { $inc: { likesCount: 1 } },
      { new: true, select: "likesCount title bookId" }
    )
      .populate<{ bookId: { _id: string; authorId: string; title: string } }>({
        path: "bookId",
        select: "authorId title",
      })
      .lean();

    const likesCount = chapter?.likesCount ?? 0;

    if (chapter?.bookId?.authorId && LIKE_MILESTONES.includes(likesCount)) {
      dispatchNotification({
        userId: chapter.bookId.authorId,
        type: "chapter_liked_milestone",
        chapterId,
        bookId: chapter.bookId._id,
        message: `${chapter.title ?? "Your chapter"} just hit ${likesCount} likes!`,
        link: `/book/${chapter.bookId._id}/chapter/${chapterId}`,
      }).catch((err) => console.error("[notif] like milestone failed:", err));
    }

    return ok({ liked: true, likesCount });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    if (err?.code !== 11000) throw err;

    await ChapterLike.deleteOne({ chapterId, userId });
    const chapter = await Chapter.findByIdAndUpdate(
      chapterId,
      { $inc: { likesCount: -1 } },
      { new: true, select: "likesCount" }
    ).lean();
    return ok({ liked: false, likesCount: Math.max(0, chapter?.likesCount ?? 0) });
  }
});