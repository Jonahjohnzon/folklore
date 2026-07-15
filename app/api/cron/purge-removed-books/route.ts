// app/api/cron/purge-removed-books/route.ts
import { NextRequest } from "next/server";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { Book } from "@/app/api/lib/models/Book";
import { deleteBookCascade } from "@/app/api/lib/services/deleteBookCascade";
import { ok, fail } from "@/app/api/response";

const TEN_DAYS_MS = 10 * 24 * 60 * 60 * 1000;

export const GET = async (req: NextRequest) => {
  try {
    // Vercel Cron sends this header automatically; also allow a manual
    // trigger with the same bearer token for testing/ops.
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return fail(new Error("Unauthorized"));
    }

    await connectToDatabase();

    const cutoff = new Date(Date.now() - TEN_DAYS_MS);

    // deletedAt is set when status transitions to "removed" — books
    // removed more recently than the cutoff are left alone.
    const candidates = await Book.find(
      { status: "removed", deletedAt: { $ne: null, $lte: cutoff } },
      { _id: 1, title: 1 }
    ).lean();

    const results = [];
    for (const b of candidates) {
      const result = await deleteBookCascade(b._id);
      results.push({ title: b.title, ...result });
    }

    return ok({ purged: results.length, results });
  } catch (error) {
    return fail(error);
  }
};