/* eslint-disable @typescript-eslint/no-explicit-any */
// GET /api/library/route.ts
import { withAuth } from "@/app/api/auth/withAuth";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { LibraryEntry } from "@/app/api/lib/models/LibraryEntry";
import { Book } from "@/app/api/lib/models/Book";
import { ok, fail } from "@/app/api/response";
import { Types } from "mongoose";

const DROPPED_AFTER_MS = 90 * 24 * 60 * 60 * 1000;

export const GET = withAuth(async (req) => {
  try {
    await connectToDatabase();

    const statusParam = new URL(req.url).searchParams.get("status");
    const cutoff = new Date(Date.now() - DROPPED_AFTER_MS);

    const pipeline: any[] = [
      { $match: { userId: new Types.ObjectId(req.user.sub) } },
      {
        $addFields: {
          effectiveStatus: {
            $cond: [
              { $and: [{ $eq: ["$status", "reading"] }, { $lt: ["$lastActivityAt", cutoff] }] },
              "dropped",
              "$status",
            ],
          },
        },
      },
    ];

    if (statusParam) pipeline.push({ $match: { effectiveStatus: statusParam } });

    pipeline.push(
      { $sort: { lastActivityAt: -1 } },
      { $lookup: { from: Book.collection.name, localField: "bookId", foreignField: "_id", as: "book" } },
      { $unwind: "$book" } // rows whose book was deleted get dropped here, same effect as your old .filter((e) => e.bookId)
    );

    const entries = await LibraryEntry.aggregate(pipeline);

    return ok({
      entries: entries.map((e) => ({
        bookId: String(e.book._id),
        status: e.effectiveStatus,
        addedAt: e.addedAt,
        updatedAt: e.lastActivityAt || 0,
        book: {
          title: e.book.title,
          slug: e.book.slug,
          coverUrl: e.book.coverUrl ?? null,
        },
      })),
    });
  } catch (error) {
    return fail(error);
  }
});