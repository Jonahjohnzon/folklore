import { Comment } from "@/app/api/lib/models/Comment";
import {connectToDatabase} from "@/app/api/lib/db/connect";
import { CommentLike } from "@/app/api/lib/models/CommentLike";
import { withAuth } from "@/app/api/auth/withAuth";
import {ok, fail} from "@/app/api/response";

export const POST = withAuth(async (req, ctx) => {
  await connectToDatabase();
  const { commentId } = await ctx.params;
   if (!commentId) return fail("Invalid chapter id");
 
   const userId = await req.user?.sub;
  if (!userId) return fail("Sign in required");
 
  const exists = await Comment.exists({ _id: commentId, deleted: false });
  if (!exists) return fail( "Comment not found" );
 
  try {
    await CommentLike.create({ commentId, userId });
    const comment = await Comment.findByIdAndUpdate(
      commentId,
      { $inc: { likesCount: 1 } },
      { new: true, select: "likesCount" }
    ).lean();
    return ok({ liked: true, likesCount: comment?.likesCount ?? 0 });
  } catch (err: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((err as any)?.code !== 11000) throw err;
 
    await CommentLike.deleteOne({ commentId, userId });
    const comment = await Comment.findByIdAndUpdate(
      commentId,
      { $inc: { likesCount: -1 } },
      { new: true, select: "likesCount" }
    ).lean();
    return ok({ liked: false, likesCount: Math.max(0, comment?.likesCount ?? 0) });
  }
})