// GET /api/library/counts/route.ts
import { withAuth } from "@/app/api/auth/withAuth";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { LibraryEntry } from "@/app/api/lib/models/LibraryEntry";
import { ok, fail } from "@/app/api/response";
import { Types } from "mongoose";

const DROPPED_AFTER_DAYS = 90;

export const GET = withAuth(async (req) => {
  try {
    await connectToDatabase();
    const cutoff = new Date(Date.now() - DROPPED_AFTER_DAYS * 24 * 60 * 60 * 1000);

    const rows = await LibraryEntry.aggregate([
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
      { $group: { _id: "$effectiveStatus", count: { $sum: 1 } } },
    ]);

    const counts = { reading: 0, want_to_read: 0, completed: 0, dropped: 0, all: 0 };
    for (const r of rows) {
      counts[r._id as keyof typeof counts] = r.count;
      counts.all += r.count;
    }

    return ok({ counts });
  } catch (error) {
    return fail(error);
  }
});