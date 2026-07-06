import { Types } from "mongoose";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { optionalAuth } from "@/app/api/auth/optionalAuth";
import { ok, fail } from "@/app/api/response";
import { ParagraphComment } from "@/app/api/lib/models/ParagraphComment";
import { withAuth } from "@/app/api/auth/withAuth";

function serializeReply(doc: any, viewerId?: string) {
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
    parentId: doc.parentId.toString(),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

// GET /api/books/chapters/:chapterId/comments/:commentId/replies
// Fetched lazily — only called once the user clicks "View N replies".
export const GET = withAuth(async (req, ctx) => {
  try {
    const { chapterId, commentId } = await ctx.params;
    if (!chapterId) return fail("Invalid id");

    await connectToDatabase();

    const replies = await ParagraphComment.find({ chapterId, parentId: commentId })
      .sort({ createdAt: 1 })
      .populate("userId", "username avatarUrl")
      .lean();

    return ok({ replies: replies.map((r) => serializeReply(r, req.user?.sub)) });
  } catch (error) {
    return fail(error);
  }
});