
import {connectToDatabase} from "@/app/api/lib/db/connect";
import { Chapter } from "@/app/api/lib/models/Chapter";
import { ChapterLike } from "@/app/api/lib/models/ChapterLike";
import { withAuth } from "@/app/api/auth/withAuth";
import {optionalAuth} from "@/app/api/auth/optionalAuth";
import {ok, fail} from "@/app/api/response";

export const GET = withAuth(async (req, ctx) => {
  await connectToDatabase();
  const { chapterId } = await ctx.params;
  if (!chapterId) return fail("Invalid chapter id");

    const userId = req.user?.sub;
  const [likesCount, existingLike] = await Promise.all([
    ChapterLike.countDocuments({ chapterId}),
    userId ? ChapterLike.exists({ chapterId, userId }) : null,
  ]);
  return ok({ liked: Boolean(existingLike), likesCount: likesCount || 0});
})

export const POST = withAuth(async (req, ctx) => {
  await connectToDatabase();
  const { chapterId } = await ctx.params;
  if (!chapterId) return fail("Invalid chapter id");


  const userId =  req.user?.sub;
  if (!userId) return fail("Sign in required");

  // Try to like first. If it already exists, the unique index throws
  // E11000 — we treat that as "unlike" instead. This keeps the toggle
  // correct even under a concurrent double-click, without a separate
  // read-then-write race.
  try {
    await ChapterLike.create({ chapterId, userId });
    const chapter = await Chapter.findByIdAndUpdate(
      chapterId,
      { $inc: { likesCount: 1 } },
      { new: true, select: "likesCount" }
    ).lean();
    return ok({ liked: true, likesCount: chapter?.likesCount ?? 0 });
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
})