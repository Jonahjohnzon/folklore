import { z } from "zod";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { withAuth } from "@/app/api/auth/withAuth";
import { ok, fail } from "@/app/api/response";
import { ParagraphComment } from "@/app/api/lib/models/ParagraphComment";
import { ChapterCommentCount } from "@/app/api/lib/models/ChapterCommentCount";
import { Chapter } from "@/app/api/lib/models/Chapter";
import { Book } from "@/app/api/lib/models/Book";
import { User } from "@/app/api/lib/models/User";

const editCommentSchema = z.object({
  body: z.string().trim().min(1).max(1000),
});


function asString(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

const MODERATOR_ROLES = new Set(["moderator", "admin"]);

async function canModerate(userId: string, chapterId: string) {
  const user = await User.findById(userId).select("role").lean();
  if (user && MODERATOR_ROLES.has(user.role)) return true;

  const chapter = await Chapter.findById(chapterId).select("bookId").lean();
  if (!chapter) return false;

  const book = await Book.findById(chapter.bookId).select("authorId").lean();
  if (!book) return false;

  return book.authorId.toString() === userId;
}

export const PATCH = withAuth(async (req, ctx) => {
  try {
    const rawParams = await ctx.params;
    const chapterId = asString(rawParams.chapterId);
    const commentId = asString(rawParams.commentId);
    if (!chapterId || !commentId) return fail("Invalid id");

    const userId = req.user.sub;
    if (!userId) return fail("Invalid user");

    const json = await req.json().catch(() => null);
    const parsed = editCommentSchema.safeParse(json);
    if (!parsed.success) return fail("Invalid body");

    await connectToDatabase();

    const existing = await ParagraphComment.findOne({ _id: commentId, chapterId }).select("userId").lean();
    if (!existing) return fail("Comment not found");

    if (existing.userId.toString() !== userId) return fail("You can only edit your own comment");

    const updated = await ParagraphComment.findByIdAndUpdate(
      commentId,
      { body: parsed.data.body },
      { new: true }
    ).populate("userId", "username avatarUrl");

    return ok({
      comment: {
        id: updated!._id.toString(),
        body: updated!.body,
        updatedAt: updated!.updatedAt,
      },
    });
  } catch (error) {
    return fail(error);
  }
});

export const DELETE = withAuth(async (req, ctx) => {
  try {
    const rawParams = await ctx.params;
    const chapterId = asString(rawParams.chapterId);
    const commentId = asString(rawParams.commentId);
    if (!chapterId || !commentId) return fail("Invalid id");

    const userId = req.user.sub;
    if (!userId) return fail("Invalid user");

    await connectToDatabase();

    const existing = await ParagraphComment.findOne({ _id: commentId, chapterId })
      .select("userId parentId paragraphIndex")
      .lean();
    if (!existing) return fail("Comment not found");

    const isOwn = existing.userId.toString() === userId;
    if (!isOwn) {
      const allowed = await canModerate(userId, chapterId);
      if (!allowed) return fail("You can only delete your own comment");
    }

    const isTopLevel = !existing.parentId;

    if (isTopLevel) {
      await ParagraphComment.deleteMany({ $or: [{ _id: commentId }, { parentId: commentId }] });

      const field = `counts.${existing.paragraphIndex}`;
      await ChapterCommentCount.updateOne(
        { chapterId },
        [
          {
            $set: {
              [field]: {
                $max: [0, { $subtract: [{ $ifNull: [`$${field}`, 0] }, 1] }],
              },
            },
          },
        ],
        { upsert: true }
      );
    } else {
      await ParagraphComment.deleteOne({ _id: commentId });
    }

    return ok({ deletedId: commentId, cascaded: isTopLevel, moderated: !isOwn });
  } catch (error) {
    return fail(error);
  }
});