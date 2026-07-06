import { withAuth } from "@/app/api/auth/withAuth";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { Book } from "@/app/api/lib/models/Book";
import { Chapter } from "@/app/api/lib/models/Chapter";
import { ok, fail } from "@/app/api/response";
import { NotFoundError, ForbiddenError, ValidationError } from "@/app/api/lib/db/errors";

export const POST = withAuth(async (req, ctx) => {
  try {
    await connectToDatabase();

    const { bookId, chapterId } = await ctx.params;
    const book = await Book.findById(bookId);
    if (!book) throw new NotFoundError("Book not found");
    if (String(book.authorId) !== String(req.user.sub)) {
      throw new ForbiddenError("You don't have access to this book");
    }

    const chapter = await Chapter.findOne({ _id: chapterId, bookId: book._id });
    if (!chapter) throw new NotFoundError("Chapter not found");
    if (!chapter.title.trim() || !chapter.content?.trim()) {
      throw new ValidationError("Chapter needs a title and content before publishing", {});
    }

    if (!chapter.publishedAt) {
      chapter.publishedAt = new Date();
    }
    await chapter.save();

    if (book.status === "draft") {
      book.status = "ongoing";
      book.publishedAt = book.publishedAt ?? new Date();
      await book.save();
    }

    return ok({ chapter });
  } catch (error) {
    return fail(error);
  }
});