import { Types } from "mongoose";
import { Comment } from "@/app/api/lib/models/Comment";
import { CommentLike } from "@/app/api/lib/models/CommentLike";
import { serializeComment } from "@/app/api/lib/serialize-comment";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { Chapter } from "@/app/api/lib/models/Chapter";
import { Book } from "@/app/api/lib/models/Book";
import { withAuth } from "@/app/api/auth/withAuth";
import { ok, fail } from "@/app/api/response";
import { dispatchNotification } from "@/lib/notifications/dispatch";
import { PopulatedCommentDoc } from "@/app/api/lib/serialize-comment";

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;
const MAX_CONTENT_LENGTH = 2000;

export const GET = withAuth(async (req, ctx) => {
  await connectToDatabase();
  const { chapterId } = await ctx.params;
  if (!chapterId) return fail("Invalid chapter id");

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, Number(searchParams.get("limit") ?? DEFAULT_PAGE_SIZE)));
  const paragraphIndexParam = searchParams.get("paragraphIndex");
  const paragraphIndex = paragraphIndexParam !== null ? Number(paragraphIndexParam) : null;

  const filter = {
    chapterId,
    parentId: null,
    deleted: false,
    paragraphIndex,
  };

  const userId = req.user?.sub;

  const [total, comments] = await Promise.all([
    Comment.countDocuments(filter),
    Comment.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("userId", "name username avatarUrl")
      .lean() as unknown as Promise<PopulatedCommentDoc[]>,
  ]);

  let likedIds = new Set<string>();
  if (userId && comments.length > 0) {
    const likes = await CommentLike.find({
      userId,
      commentId: { $in: comments.map((c) => c._id) },
    })
      .select("commentId")
      .lean();
    likedIds = new Set(likes.map((l) => String(l.commentId)));
  }

  return ok({
    comments: comments.map((c) => serializeComment(c, likedIds)),
    page,
    limit,
    total,
    hasMore: page * limit < total,
  });
});

export const POST = withAuth(async (req, ctx) => {
   await connectToDatabase();
  const params = await ctx.params;
  const chapterId = Array.isArray(params.chapterId) ? params.chapterId[0] : params.chapterId;
  if (!chapterId) return fail("Invalid chapter id");

  const userId = req.user?.sub;
  if (!userId) return fail("Sign in required");

  const body = await req.json().catch(() => null);
  const content = typeof body?.content === "string" ? body.content.trim() : "";
  const paragraphIndex = typeof body?.paragraphIndex === "number" ? body.paragraphIndex : null;
  const parentId =
    typeof body?.parentId === "string" && Types.ObjectId.isValid(body.parentId) ? body.parentId : null;

  if (!content) return fail("Comment can't be empty");
  if (content.length > MAX_CONTENT_LENGTH) {
    return fail("Comment is too long");
  }

  const chapter = await Chapter.findById(chapterId).select("bookId").lean();
  if (!chapter) return fail("Chapter not found");

  let parent = null;
  if (parentId) {
    parent = await Comment.findOne({ _id: parentId, chapterId, deleted: false });
    if (!parent) {
      return fail("Comment being replied to no longer exists");
    }
  }

  const comment = await Comment.create({
    chapterId,
    bookId: chapter.bookId,
    userId,
    parentId: parentId ?? null,
    paragraphIndex: parentId ? parent?.paragraphIndex ?? null : paragraphIndex,
    content,
  });

  await Promise.all([
    parentId ? Comment.findByIdAndUpdate(parentId, { $inc: { repliesCount: 1 } }) : Promise.resolve(),
    Chapter.findByIdAndUpdate(chapterId, { $inc: { commentsCount: 1 } }),
  ]);

  const populated = await comment.populate("userId", "name username avatarUrl");
  const populatedObj = populated.toObject() as unknown as PopulatedCommentDoc;
  const actorName = populatedObj.userId?.name || populatedObj.userId?.username || "Someone";

  // --- notification dispatch ---
  // fire-and-forget-ish: awaited so errors are caught by the route's own error
  // handling, but dispatchNotification never throws (email failures are swallowed inside it)
  const book = await Book.findById(chapter.bookId).select("authorId title slug").lean();

  if (book) {
    if (parentId && parent) {
      // reply — notify the parent comment's author (unless replying to yourself)
      // IMPORTANT: link anchors on the PARENT comment id, because the reply itself
      // is hidden inside a collapsed thread until the parent is expanded. The reply's
      // own id is passed as `highlight` so the frontend can scroll/flash it once
      // the thread is expanded.
      if (String(parent.userId) !== String(userId)) {
        const appLink = `/book/${book.slug}/chapter/${chapterId}?highlight=${comment._id}#comment-${parentId}`;
        const fullLink = `https://tipatale.com/book/${book.slug}/chapter/${chapterId}?highlight=${comment._id}#comment-${parentId}`;

        await dispatchNotification({
          userId: parent.userId,
          type: "comment_reply",
          actorId: userId,
          bookId: chapter.bookId,
          chapterId,
          commentId: comment._id,
          message: `${actorName} replied to your comment`,
          link: appLink,
          email: {
            templateName: "commentReplyTemplate",
            templateArgs: {
              actorName,
              bookTitle: book.title,
              commentExcerpt: content.slice(0, 140),
              link: fullLink,
            },
          },
        });
      }
    } else {
      // top-level comment — notify the book's author (unless commenting on your own book)
      if (String(book.authorId) !== String(userId)) {
        const appLink = `/book/${book.slug}/chapter/${chapterId}#comment-${comment._id}`;
        const fullLink = `https://tipatale.com/book/${book.slug}/chapter/${chapterId}#comment-${comment._id}`;

        await dispatchNotification({
          userId: book.authorId,
          type: "new_comment",
          actorId: userId,
          bookId: chapter.bookId,
          chapterId,
          commentId: comment._id,
          message: `${actorName} commented on ${book.title}`,
          link: appLink,
          email: {
            templateName: "newCommentTemplate",
            templateArgs: {
              actorName,
              bookTitle: book.title,
              commentExcerpt: content.slice(0, 140),
              link: fullLink,
            },
          },
        });
      }
    }
  }

  return ok({ comment: serializeComment(populatedObj, new Set()) });
});