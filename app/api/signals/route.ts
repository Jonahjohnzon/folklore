// app/api/signals/route.ts
// Frontend fires-and-forgets these as the user reads, searches, clicks tags.
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { AlgoSignal } from "@/app/api/lib/models/Algo";
import { ok, fail } from "@/app/api/response";

import { withAuth } from "../auth/withAuth";
const VALID_SIGNALS = new Set([
  "read_chapter", "completed_book", "abandoned_book", "purchased_chapter",
  "reviewed", "shared", "time_on_page", "skipped_chapter", "search_query", "tag_clicked",
]);

export const POST = withAuth(async (req) => {
  try {
    const body = await req.json();
    const { signal, bookId, chapterId, tagId, payload, weight } = body ?? {};

    if (!VALID_SIGNALS.has(signal)) {
      return fail({ message: "Invalid signal type", status: 400 });
    }

    await connectToDatabase();
    await AlgoSignal.create({
      userId: req?.user.sub,
      signal,
      bookId: bookId || undefined,
      chapterId: chapterId || undefined,
      tagId: tagId || undefined,
      payload: payload ?? {},
      weight: typeof weight === "number" ? weight : 1.0,
    });

    return ok({ recorded: true });
  } catch (error) {
    return fail(error);
  }
});