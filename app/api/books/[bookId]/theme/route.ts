import { withAuth } from "@/app/api/auth/withAuth";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { Book } from "@/app/api/lib/models/Book";
import { BookTheme } from "@/app/api/lib/models/BookTheme";
import { updateBookThemeSchema } from "@/app/api/validation/book.schema";
import { ok, fail } from "@/app/api/response";
import { NotFoundError, ForbiddenError, ValidationError } from "@/app/api/lib/db/errors";

export const GET = withAuth(async (req, ctx) => {
  try {
    await connectToDatabase();
    const { bookId } = await ctx.params;
    const theme = await BookTheme.findOne({ bookId });
    if (!theme) throw new NotFoundError("Theme not found");
    return ok({ theme });
  } catch (error) {
    return fail(error);
  }
});

export const PATCH = withAuth(async (req, ctx) => {
  try {
    await connectToDatabase();
    const { bookId } = await ctx.params;

    const book = await Book.findById(bookId);
    if (!book) throw new NotFoundError("Book not found");
    if (String(book.authorId) !== String(req.user.sub)) {
      throw new ForbiddenError("You don't have access to this book");
    }

    const body = await req.json();
    console.log("Received body for theme update:", body);
    const parsed = updateBookThemeSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError("Invalid input", parsed.error.flatten().fieldErrors);
    }

    const theme = await BookTheme.findOneAndUpdate(
      { bookId: book._id },
      { $set: parsed.data },
      { new: true, upsert: true }
    );

    return ok({ theme });
  } catch (error) {
    return fail(error);
  }
});