import { Comment } from "@/app/api/lib/models/Comment";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { Chapter } from "@/app/api/lib/models/Chapter";
import { withAuth } from "@/app/api/auth/withAuth";
import { ok, fail } from "@/app/api/response";

export const DELETE = withAuth(async (req, ctx) => {
  await connectToDatabase();
  const { commentId } = await ctx.params;
  if (!commentId) return fail("Invalid chapter id");
  const userId = await req.user?.sub;
  if (!userId) return fail("Sign in required");

  const comment = await Comment.findById(commentId);
  if (!comment || comment.deleted) {
    return fail("Comment not found");
  }
  if (String(comment.userId) !== String(userId)) {
    return fail("You can only delete your own comment");
  }
  console.log(comment)

  comment.deleted = true;
  
  await comment.save();

  await Chapter.findByIdAndUpdate(comment.chapterId, { $inc: { commentsCount: -1 } });

  return ok({ success: true });
});

export const PATCH = withAuth(async (req, ctx) => {
  await connectToDatabase();
  const { commentId } = await ctx.params;
  if (!commentId) return fail("Invalid comment id");

  const userId = await req.user?.sub;
  if (!userId) return fail("Sign in required");

  const body = await req.json().catch(() => null);
  const content = typeof body?.content === "string" ? body.content.trim() : "";
  if (!content) return fail("Comment can't be empty");
  if (content.length > 1000) return fail("Comment is too long");

  const comment = await Comment.findById(commentId);
  if (!comment || comment.deleted) {
    return fail("Comment not found");
  }
  if (String(comment.userId) !== String(userId)) {
    return fail("You can only edit your own comment");
  }

  comment.content = content;
  comment.edited = true;
  await comment.save();

  return ok({
    comment: {
      _id: String(comment._id),
      content: comment.content,
      edited: comment.edited,
      updatedAt: comment.updatedAt,
    },
  });
});