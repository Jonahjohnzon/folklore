
import { Comment } from "@/app/api/lib/models/Comment";
import {connectToDatabase} from "@/app/api/lib/db/connect";
import { CommentLike } from "@/app/api/lib/models/CommentLike";
import { withAuth } from "@/app/api/auth/withAuth";
import {ok, fail} from "@/app/api/response";
import { serializeComment } from "@/app/api/lib/serialize-comment";

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;
 
export const  GET = withAuth(async (req, ctx) => {
  await connectToDatabase();
  const { commentId } = await ctx.params;
   if (!commentId) return fail("Invalid chapter id");
 
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, Number(searchParams.get("limit") ?? DEFAULT_PAGE_SIZE)));
 
  const userId = await req.user?.sub;
  if (!userId) return fail("Sign in required");
  const filter = { parentId: commentId, deleted: false };
 
  const [total, replies] = await Promise.all([
    Comment.countDocuments(filter),
    Comment.find(filter)
      .sort({ createdAt: 1 }) // oldest first — reads like a thread
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("userId", "name username avatarUrl")
      .lean(),
  ]);
 
  let likedIds = new Set<string>();
  if (userId && replies.length > 0) {
    const likes = await CommentLike.find({
      userId,
      commentId: { $in: replies.map((r) => r._id) },
    })
      .select("commentId")
      .lean();
    likedIds = new Set(likes.map((l) => String(l.commentId)));
  }
 
  return ok({
    replies: replies.map((r) => serializeComment(r, likedIds)),
    page,
    limit,
    total,
    hasMore: page * limit < total,
  });
})