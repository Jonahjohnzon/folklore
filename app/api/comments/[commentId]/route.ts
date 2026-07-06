
import { Comment } from "@/app/api/lib/models/Comment";
import {connectToDatabase} from "@/app/api/lib/db/connect";
import { Chapter } from "@/app/api/lib/models/Chapter";
import { withAuth } from "@/app/api/auth/withAuth";
import {ok, fail} from "@/app/api/response";


export const DELETE = withAuth(async (req, ctx) => {
  await connectToDatabase();
  const { commentId } = await ctx.params;
   if (!commentId) return fail("Invalid chapter id");

  const userId = await req.user?.sub;
  if (!userId) return fail("Sign in required");

  const comment = await Comment.findById(commentId);
  if (!comment || comment.deleted) {
    return fail("Comment not found" );
  }
  if (String(comment.userId) !== String(userId)) {
    return fail("You can only delete your own comment" );
  }

  // Soft delete: the row (and any replies pointing at it) stays intact,
  // just blanked out, so reply threads and counters don't break.
  comment.deleted = true;
  comment.content = "";
  await comment.save();

  await Chapter.findByIdAndUpdate(comment.chapterId, { $inc: { commentsCount: -1 } });

  return ok({ success: true });
})



