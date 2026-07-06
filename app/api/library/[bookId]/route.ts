import { withAuth } from "@/app/api/auth/withAuth";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { Book } from "@/app/api/lib/models/Book";
import { LibraryEntry } from "@/app/api/lib/models/LibraryEntry";
import { ok, fail } from "@/app/api/response";
import { NotFoundError, ValidationError } from "@/app/api/lib/db/errors";

const VALID_STATUSES = ["reading", "want_to_read", "completed", "dropped"] as const;
type LibraryStatus = (typeof VALID_STATUSES)[number];

async function resolveBook(bookId: string | string[]) {
  const book = await Book.findById(bookId).select("_id").lean();
  if (!book) throw new NotFoundError("Book not found");
  return book;
}

export const PUT = withAuth(async (req, ctx) => {
  try {
    await connectToDatabase();
    const { bookId } = await ctx.params;
    await resolveBook(bookId);

    const body = await req.json().catch(() => null);
    const status = body?.status as LibraryStatus | undefined;
    if (!status || !VALID_STATUSES.includes(status)) {
      throw new ValidationError("status must be one of reading, want_to_read, completed, dropped");
    }

    const entry = await LibraryEntry.findOneAndUpdate(
      { userId: req.user.sub, bookId },
      { $set: { status }, $setOnInsert: { addedAt: new Date() } },
      { upsert: true, new: true }
    ).lean();

    return ok({ bookId, status: entry.status, addedAt: entry.addedAt, updatedAt: entry.updatedAt });
  } catch (error) {
    return fail(error);
  }
});

export const DELETE = withAuth(async (req, ctx) => {
  try {
    await connectToDatabase();
    const { bookId } = await ctx.params;
    await LibraryEntry.deleteOne({ userId: req.user.sub, bookId });
    return ok({ removed: true });
  } catch (error) {
    return fail(error);
  }
});