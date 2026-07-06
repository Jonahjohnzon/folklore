// app/api/books/[bookId]/restore/route.ts
import { withAuth } from "@/app/api/auth/withAuth";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { Book } from "@/app/api/lib/models/Book";
import { ok, fail } from "@/app/api/response";
import { NotFoundError, ForbiddenError, ValidationError } from "@/app/api/lib/db/errors";
import { BookStatus } from "@/lib/types";

const GRACE_PERIOD_DAYS = 30;

const VALID_STATUSES: BookStatus[] = ["draft", "ongoing", "completed", "hiatus", "removed"];

function isBookStatus(value: string | null): value is BookStatus {
  return value !== null && (VALID_STATUSES as string[]).includes(value);
}

export const POST = withAuth(async (req, ctx) => {
  try {
    await connectToDatabase();
    const { bookId } = await ctx.params;

    const book = await Book.findById(bookId);
    if (!book) throw new NotFoundError("Book not found");
    if (String(book.authorId) !== req.user.sub) throw new ForbiddenError("Not your book");
    if (book.status !== "removed" || !book.deletedAt) {
      throw new ValidationError("Book isn't deleted", {});
    }

    const daysSinceDelete = (Date.now() - book.deletedAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceDelete > GRACE_PERIOD_DAYS) {
      throw new ValidationError("Restore window has expired", {});
    }
    if (!isBookStatus(book.statusBeforeDelete)) {
    throw new Error("Cannot restore book: statusBeforeDelete is missing or invalid");
    }

    book.status = book.statusBeforeDelete as BookStatus;
    book.statusBeforeDelete = null;
    book.deletedAt = null;
    await book.save();

    return ok({ book });
  } catch (error) {
    return fail(error);
  }
});