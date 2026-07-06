import { z } from "zod";
import { Types } from "mongoose";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { withAuth } from "@/app/api/auth/withAuth";
import { optionalAuth } from "@/app/api/auth/optionalAuth";
import { ok, fail } from "@/app/api/response";
import { Chapter } from "@/app/api/lib/models/Chapter";
import { ParagraphComment } from "@/app/api/lib/models/ParagraphComment";
import { ChapterCommentCount } from "@/app/api/lib/models/ChapterCommentCount";

const createCommentSchema = z.object({
  paragraphIndex: z.number().int().min(0),
  body: z.string().trim().min(1).max(1000),
  parentId: z.string().optional(),
});

// Shared shape for a populated user reference — either a hydrated doc or
// just the raw ObjectId if population failed/was skipped somehow.
function serializeComment(doc: any, viewerId?: string) {
  const user = doc.userId && typeof doc.userId === "object" ? doc.userId : null;

  return {
    id: doc._id.toString(),
    chapterId: doc.chapterId.toString(),
    paragraphIndex: doc.paragraphIndex,
    userId: user ? user._id.toString() : doc.userId.toString(),
    username: user?.username ?? "Unknown",
    avatarUrl: user?.avatarUrl ?? null,
    body: doc.body,
    helpfulVotes: doc.helpfulVotes,
    lovedByMe: !!viewerId && (doc.lovedBy ?? []).some((id: Types.ObjectId) => id.toString() === viewerId),
    parentId: doc.parentId ? doc.parentId.toString() : null,
    replyCount: typeof doc.replyCount === "number" ? doc.replyCount : undefined,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

// GET /api/books/chapters/:chapterId/comments?paragraphIndex=3&skip=0&limit=10
// Returns TOP-LEVEL comments only, paginated, each with a replyCount so the
// client can render "View N replies" without fetching the replies themselves.
export const GET = optionalAuth(async (req, ctx) => {
  try {
    const { chapterId } = await ctx.params;
    if (!chapterId) return fail("Invalid chapter id");

    const paragraphIndexRaw = req.nextUrl.searchParams.get("paragraphIndex");
    if (paragraphIndexRaw === null) return fail("paragraphIndex is required");
    const paragraphIndex = Number(paragraphIndexRaw);
    if (!Number.isInteger(paragraphIndex) || paragraphIndex < 0) {
      return fail("paragraphIndex must be a non-negative integer");
    }

    const skip = Math.max(0, Number(req.nextUrl.searchParams.get("skip") ?? 0));
    const limit = Math.min(50, Math.max(1, Number(req.nextUrl.searchParams.get("limit") ?? 10)));

    await connectToDatabase();

    const viewerId = req.user?.sub;

    const filter = { chapterId, paragraphIndex, parentId: { $exists: false } };

    const [comments, total] = await Promise.all([
      ParagraphComment.find(filter)
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "username avatarUrl")
        .lean(),
      ParagraphComment.countDocuments(filter),
    ]);

    // Reply counts in one grouped query rather than N+1.
    const parentIds = comments.map((c) => c._id);
    const replyCounts = await ParagraphComment.aggregate([
      { $match: { parentId: { $in: parentIds } } },
      { $group: { _id: "$parentId", count: { $sum: 1 } } },
    ]);
    const countByParent = new Map(replyCounts.map((r) => [r._id.toString(), r.count]));

    const withCounts = comments.map((c) => ({
      ...c,
      replyCount: countByParent.get(c._id.toString()) ?? 0,
    }));

    return ok({
      comments: withCounts.map((c) => serializeComment(c, viewerId)),
      total,
      hasMore: skip + comments.length < total,
    });
  } catch (error) {
    return fail(error);
  }
});

// POST /api/books/chapters/:chapterId/comments
export const POST = withAuth(async (req, ctx) => {
  try {
    const { chapterId } = await ctx.params;
    if (!chapterId) return fail("Invalid chapter id");

    const json = await req.json().catch(() => null);
    const parsed = createCommentSchema.safeParse(json);
    if (!parsed.success) return fail("Invalid body");
    const { paragraphIndex, body, parentId } = parsed.data;

    if (parentId && !Types.ObjectId.isValid(parentId)) return fail("Invalid parentId");

    const userId = req.user.sub;
    if (!userId || !Types.ObjectId.isValid(userId)) return fail("Invalid user");

    await connectToDatabase();

    const chapter = await Chapter.findById(chapterId).select("bookId").lean();
    if (!chapter) return fail("Chapter not found");

    if (parentId) {
      const parent = await ParagraphComment.findById(parentId).select("chapterId paragraphIndex").lean();
      if (!parent || parent.chapterId.toString() !== chapterId || parent.paragraphIndex !== paragraphIndex) {
        return fail("Parent comment not found for this paragraph");
      }
    }

    let comment = await ParagraphComment.create({
      chapterId,
      bookId: chapter.bookId,
      paragraphIndex,
      userId,
      body,
      parentId: parentId || undefined,
    });

    // Populate before returning so the client immediately has username/avatar
    // without a follow-up fetch.
    comment = await comment.populate("userId", "username avatarUrl");

    if (!parentId) {
      await ChapterCommentCount.updateOne(
        { chapterId },
        { $inc: { [`counts.${paragraphIndex}`]: 1 } },
        { upsert: true }
      );
    }

    return ok({ comment: serializeComment(comment, userId) }, 201);
  } catch (error) {
    return fail(error);
  }
});