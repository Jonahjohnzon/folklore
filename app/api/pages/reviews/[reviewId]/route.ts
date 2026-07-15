// app/api/pages/reviews/[reviewId]/route.ts
import { withAuth } from "@/app/api/auth/withAuth";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { Review, ReviewVote } from "@/app/api/lib/models/Reviews";
import { recalculateBookRating } from "@/app/api/lib/reviews/recalculate-rating";
import { ok, fail } from "@/app/api/response";
import { NotFoundError, ForbiddenError } from "@/app/api/lib/db/errors";

export const DELETE = withAuth(async (req, ctx) => {
  try {
    await connectToDatabase();
    const { reviewId } = await ctx.params;

    const review = await Review.findById(reviewId);
    if (!review) throw new NotFoundError("Review not found");

    if (String(review.userId) !== String(req.user.sub)) {
      throw new ForbiddenError("You can only delete your own review");
    }

    const bookId = review.bookId;

    await Review.deleteOne({ _id: reviewId });
    await ReviewVote.deleteMany({ reviewId }); // otherwise these dangle and skew nothing but waste rows

    await recalculateBookRating(bookId);

    return ok({ deleted: true });
  } catch (error) {
    return fail(error);
  }
});