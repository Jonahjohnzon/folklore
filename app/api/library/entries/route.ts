/* eslint-disable @typescript-eslint/no-explicit-any */
// GET /api/library/entries/route.ts
import { withAuth } from "@/app/api/auth/withAuth";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { LibraryEntry } from "@/app/api/lib/models/LibraryEntry";
import { ok, fail } from "@/app/api/response";
import { Types } from "mongoose";

const DROPPED_AFTER_DAYS = 90;

export const GET = withAuth(async (req) => {
  try {
    await connectToDatabase();
    const status = new URL(req.url).searchParams.get("status"); // null = "all"
    const cutoff = new Date(Date.now() - DROPPED_AFTER_DAYS * 24 * 60 * 60 * 1000);

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

    if (status) pipeline.push({ $match: { effectiveStatus: status } });

    pipeline.push(
      { $sort: { lastActivityAt: -1 } },
      { $lookup: { from: "books", localField: "bookId", foreignField: "_id", as: "book" } }, // confirm collection name is "books"
      { $unwind: "$book" }
    );

    const rows = await LibraryEntry.aggregate(pipeline);

    return ok({
      entries: rows.map((e) => ({
        bookId: String(e.bookId),
        status: e.effectiveStatus,
        addedAt: e.addedAt,
        updatedAt: e.lastActivityAt,
        book: {
          slug: e.book.slug,
          title: e.book.title,
          coverUrl: e.book.coverUrl ?? null,
        },
      })),
    });
  } catch (error) {
    return fail(error);
  }
});