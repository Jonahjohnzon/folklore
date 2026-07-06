import { connectToDatabase } from "@/app/api/lib/db/connect";
import { Book } from "@/app/api/lib/models/Book";
import { ok, fail } from "@/app/api/response";
import { NotFoundError } from "@/app/api/lib/db/errors";
import { Types } from "mongoose";
import { withAuth } from "@/app/api/auth/withAuth";

// Draft/removed books never surface as recommendations, regardless of tag overlap.
const RECOMMENDABLE_STATUSES = ["ongoing", "completed", "hiatus"];
const DEFAULT_LIMIT = 8;
const MAX_LIMIT = 20;

export const GET = withAuth(async (req, ctx) => {
  try {
    await connectToDatabase();
    const { bookId: rawBookId } = await ctx.params;
    const bookId = Array.isArray(rawBookId) ? rawBookId[0] : rawBookId;

    if (!bookId) {
      return fail(new NotFoundError("Book not found"));
    }

    const source = await Book.findById(bookId).select("tags").lean();
    if (!source) throw new NotFoundError("Book not found");

    // No tags on the source book means no meaningful overlap signal —
    // return empty rather than guessing with an untagged/random fallback.
    if (!source.tags?.length) {
      return ok({ books: [] });
    }

    const { searchParams } = new URL(req.url);
    const requestedLimit = Number(searchParams.get("limit"));
    const limit = Math.min(
      Number.isFinite(requestedLimit) && requestedLimit > 0 ? requestedLimit : DEFAULT_LIMIT,
      MAX_LIMIT
    );
    const sourceId = new Types.ObjectId(bookId);

    const recommendations = await Book.aggregate([
      {
        $match: {
          _id: { $ne: sourceId },
          status: { $in: RECOMMENDABLE_STATUSES },
          tags: { $in: source.tags },
        },
      },
      {
        // How many tags this candidate shares with the book being read —
        // this is the whole "algorithm" for now: more shared tags ranks
        // higher, ties broken by reads then rating.
        $addFields: {
          overlapCount: { $size: { $setIntersection: ["$tags", source.tags] } },
        },
      },
      { $sort: { overlapCount: -1, totalReads: -1, averageRating: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "users",
          localField: "authorId",
          foreignField: "_id",
          as: "author",
        },
      },
      { $unwind: "$author" },
      {
        $project: {
          _id: 1,
          title: 1,
          slug: 1,
          coverUrl: 1,
          matureContent: 1,
          totalReads: 1,
          totalChapters: 1,
          averageRating: 1,
          reviewCount: 1,
          "author.username": 1,
          "author.penName": 1,
        },
      },
    ]);

    const books = recommendations.map((b) => ({
      _id: String(b._id),
      title: b.title,
      slug: b.slug,
      coverUrl: b.coverUrl ?? null,
      matureContent: b.matureContent,
      totalReads: b.totalReads,
      totalChapters: b.totalChapters,
      averageRating: b.averageRating,
      reviewCount: b.reviewCount,
      author: { username: b.author.username, penName: b.author.penName },
    }));

    return ok({ books });
  } catch (error) {
    return fail(error);
  }
});