
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { withAuth } from "@/app/api/auth/withAuth";
import { ok, fail } from "@/app/api/response";
import { ParagraphComment } from "@/app/api/lib/models/ParagraphComment";


export const POST = withAuth(async (req, ctx) => {
  try {
    const { chapterId, commentId } = await ctx.params;
    if (!chapterId ) return fail("Invalid id");

    const userId = req.user.sub;
    if (!userId) return fail("Invalid user");

    await connectToDatabase();

    const existing = await ParagraphComment.findOne({ _id: commentId, chapterId })
      .select("userId lovedBy")
      .lean();
    if (!existing) return fail("Comment not found");
    if (existing.userId.toString() === userId.toString()) return fail("You can't love your own comment");

    const alreadyLoved = existing.lovedBy.some((id) => id.toString() === userId.toString());

    const updated = await ParagraphComment.findOneAndUpdate(
      { _id: commentId, chapterId },
      alreadyLoved ? { $pull: { lovedBy: userId } } : { $addToSet: { lovedBy: userId } },
      { new: true }
    )
      .select("lovedBy")
      .lean();

    return ok({
      comment: {
        id: commentId,
        helpfulVotes: updated!.lovedBy.length,
        lovedByMe: !alreadyLoved,
      },
    });
  } catch (error) {
    return fail(error);
  }
});