// app/api/pages/reviews/[reviewId]/vote/route.ts
import { withAuth } from "@/app/api/auth/withAuth";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { Review, ReviewVote } from "@/app/api/lib/models/Reviews";
import { hasEliteBadge } from "@/app/api/lib/reviews/badge-gate";
import { ok, fail } from "@/app/api/response";
import { NotFoundError, ForbiddenError, ValidationError } from "@/app/api/lib/db/errors";
import { recalculateBookRating } from "@/app/api/lib/reviews/recalculate-rating";

type VoteField = "helpfulVotes" | "unhelpfulVotes";

function fieldFor(vote: string): VoteField {
  return vote === "helpful" ? "helpfulVotes" : "unhelpfulVotes";
}

export const POST = withAuth(async (req, ctx) => {
  try {
    await connectToDatabase();
    const { reviewId } = await ctx.params;
    const { vote } = await req.json();
    if (!["helpful", "unhelpful"].includes(vote)) throw new ValidationError("Invalid vote");

    const eligible = await hasEliteBadge(req.user.sub);
    if (!eligible) {
      throw new ForbiddenError("Voting is limited to readers with a top-tier reading or streak badge");
    }

    const review = await Review.findById(reviewId);
    if (!review) throw new NotFoundError("Review not found");

    const existing = await ReviewVote.findOne({ reviewId, userId: req.user.sub });

    if (!existing) {
      await ReviewVote.create({ reviewId, userId: req.user.sub, vote });
      const inc: Partial<Record<VoteField, number>> = { [fieldFor(vote)]: 1 };
      await Review.updateOne({ _id: reviewId }, { $inc: inc });
    } else if (existing.vote !== vote) {
      await ReviewVote.updateOne({ _id: existing._id }, { vote });
      const inc: Partial<Record<VoteField, number>> = {
        [fieldFor(existing.vote)]: -1,
        [fieldFor(vote)]: 1,
      };
      await Review.updateOne({ _id: reviewId }, { $inc: inc });
    }
    // same vote repeated → no-op, keeps this endpoint idempotent

    const updated = await Review.findById(reviewId).select("helpfulVotes unhelpfulVotes").lean();
    return ok({ helpfulVotes: updated!.helpfulVotes, unhelpfulVotes: updated!.unhelpfulVotes });
  } catch (error) {
    return fail(error);
  }
});




