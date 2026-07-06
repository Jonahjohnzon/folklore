// app/api/cron/purge-deleted-books/route.ts
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { Book } from "@/app/api/lib/models/Book";
import { Chapter } from "@/app/api/lib/models/Chapter";
import { BookTheme } from "@/app/api/lib/models/BookTheme";
import { ReadingProgress } from "@/app/api/lib/models/ReadingProgress";
import { LibraryEntry } from "@/app/api/lib/models/LibraryEntry";
import { Review } from "@/app/api/lib/models/Reviews";
import { ok, fail } from "@/app/api/response";
import { NextRequest } from "next/server";

const GRACE_PERIOD_DAYS = 30;

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response("Unauthorized", { status: 401 });
    }

    await connectToDatabase();
    const cutoff = new Date(Date.now() - GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000);

    const toPurge = await Book.find({ status: "removed", deletedAt: { $lte: cutoff } }).select("_id").lean();
    const bookIds = toPurge.map((b) => b._id);

    if (bookIds.length === 0) {
      return ok({ purged: 0 });
    }

    // Cascade first, book document last — if this fails partway through,
    // leftover child rows point at a book that's still "removed" rather
    // than one that's vanished, which is the safer failure mode.
    await Promise.all([
      Chapter.deleteMany({ bookId: { $in: bookIds } }),
      BookTheme.deleteMany({ bookId: { $in: bookIds } }),
      ReadingProgress.deleteMany({ bookId: { $in: bookIds } }),
      LibraryEntry.deleteMany({ bookId: { $in: bookIds } }),
      Review.deleteMany({ bookId: { $in: bookIds } }),
    ]);

    await Book.deleteMany({ _id: { $in: bookIds } });

    return ok({ purged: bookIds.length });
  } catch (error) {
    return fail(error);
  }
}