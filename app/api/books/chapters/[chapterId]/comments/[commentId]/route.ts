import { z } from "zod";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { withAuth } from "@/app/api/auth/withAuth";
import { ok, fail } from "@/app/api/response";
import { ParagraphComment } from "@/app/api/lib/models/ParagraphComment";
import { ChapterCommentCount } from "@/app/api/lib/models/ChapterCommentCount";

const editCommentSchema = z.object({
  body: z.string().trim().min(1).max(1000),
});

// PATCH /api/books/chapters/:chapterId/comments/:commentId
// Owner-only. Body text only — paragraph/parent can't be changed.
export const PATCH = withAuth(async (req, ctx) => {
  try {
    const { chapterId, commentId } = await ctx.params;
    if (!chapterId ) return fail("Invalid id");

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

// DELETE /api/books/chapters/:chapterId/comments/:commentId
// Owner-only. Deleting a top-level comment cascades to its replies (a
// dangling reply thread under a removed parent isn't useful to anyone),
// and decrements the paragraph's denormalized top-level count. Deleting a
// reply just removes that one doc — replyCount is computed on read, not
// stored, so nothing else needs to change server-side for that case.
export const DELETE = withAuth(async (req, ctx) => {
  try {
    const { chapterId, commentId } = await ctx.params;
    if (!chapterId ) return fail("Invalid id");

    const userId = req.user.sub;
    if (!userId) return fail("Invalid user");

    await connectToDatabase();

    const existing = await ParagraphComment.findOne({ _id: commentId, chapterId })
      .select("userId parentId paragraphIndex")
      .lean();
    if (!existing) return fail("Comment not found");
    if (existing.userId.toString() !== userId) return fail("You can only delete your own comment");

    const isTopLevel = !existing.parentId;

    if (isTopLevel) {
      await ParagraphComment.deleteMany({ $or: [{ _id: commentId }, { parentId: commentId }] });

      // Aggregation-pipeline update ($set with an expression, not a plain
      // object) so the "decrement, but never below 0" logic runs as a
      // single atomic step on the server. A plain `$inc: -1` can't express
      // a floor, and doing the clamp as a separate follow-up query would
      // leave a window where a concurrent delete for the same paragraph
      // could still push the stored value negative between the two steps.
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

    return ok({ deletedId: commentId, cascaded: isTopLevel });
  } catch (error) {
    return fail(error);
  }
});