/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/pages/books/[slug]/reviews/route.ts
import { withAuth } from "@/app/api/auth/withAuth";
import { optionalAuth } from "@/app/api/auth/optionalAuth";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { Book } from "@/app/api/lib/models/Book";
import { Review } from "@/app/api/lib/models/Reviews";
import { ReadingProgress } from "@/app/api/lib/models/ReadingProgress";
import { hasEliteBadge } from "@/app/api/lib/reviews/badge-gate";
import { recalculateBookRating } from "@/app/api/lib/reviews/recalculate-rating";
import { ok, fail } from "@/app/api/response";
import { NotFoundError, ForbiddenError, ValidationError } from "@/app/api/lib/db/errors";

export const GET = optionalAuth(async (req, ctx) => {
  try {
    await connectToDatabase();
    const { slug } = await ctx.params;
    const book = await Book.findOne({ slug }).select("_id").lean();
    if (!book) throw new NotFoundError("Book not found");

    const reviews = await Review.find({ bookId: book._id })
      .populate("userId", "username displayName avatarUrl")
      .sort({ isPinned: -1, helpfulVotes: -1, createdAt: -1 })
      .lean();

    return ok({
      reviews: reviews.map((r) => {
        const u = r.userId as any;
        return {
          id: String(r._id),
          userId: String(u._id),
          username: u.username,
          displayName: u.displayName ?? null,
          avatarUrl: u.avatarUrl ?? null,
          rating: r.rating,
          body: r.body ?? "",
          helpfulVotes: r.helpfulVotes,
          unhelpfulVotes: r.unhelpfulVotes,
          verifiedReader: r.verifiedReader,
          isPinned: r.isPinned,
          createdAt: r.createdAt,
        };
      }),
    });
  } catch (error) {
    return fail(error);
  }
});

export const POST = withAuth(async (req, ctx) => {
  try {
    await connectToDatabase();
    const { slug } = await ctx.params;
    const { rating, body } = await req.json();

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new ValidationError("Rating must be an integer 1-5");
    }

    const book = await Book.findOne({ slug }).select("_id").lean();
    if (!book) throw new NotFoundError("Book not found");

    const eligible = await hasEliteBadge(req.user.sub);
    if (!eligible) {
      throw new ForbiddenError("Reviewing is limited to readers with a top-tier reading or streak badge");
    }

    const hasReadChapter = await ReadingProgress.exists({ userId: req.user.sub, bookId: book._id });

    const review = await Review.findOneAndUpdate(
      { bookId: book._id, userId: req.user.sub },
      { $set: { rating, body: body?.trim() || undefined, verifiedReader: hasReadChapter !== null } },
      { upsert: true, new: true }
    );

    await recalculateBookRating(book._id);

    return ok({ review });
  } catch (error) {
    return fail(error);
  }
});