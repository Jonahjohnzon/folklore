// app/api/creator/chapters/[chapterId]/route.ts
import { withAuth } from "@/app/api/auth/withAuth";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { Book } from "@/app/api/lib/models/Book";
import { Chapter } from "@/app/api/lib/models/Chapter";
import { ok, fail } from "@/app/api/response";
import { NotFoundError, ForbiddenError } from "@/app/api/lib/db/errors";

export const DELETE = withAuth(async (req, ctx) => {
  try {
    await connectToDatabase();
    const { chapterId } = await ctx.params;

    const chapter = await Chapter.findById(chapterId);
    if (!chapter) throw new NotFoundError("Chapter not found");

    const book = await Book.findById(chapter.bookId);
    if (!book) throw new NotFoundError("Book not found");
    if (String(book.authorId) !== req.user.sub) throw new ForbiddenError("Not your book");

    const removedIndex = chapter.orderIndex;
    await chapter.deleteOne();

    // close the gap so orderIndex stays contiguous 1..N
    await Chapter.updateMany(
      { bookId: book._id, orderIndex: { $gt: removedIndex } },
      { $inc: { orderIndex: -1 } }
    );

    await Book.findByIdAndUpdate(book._id, { $inc: { totalChapters: -1 } });

    return ok({ deleted: true, totalChapters: (book.totalChapters ?? 1) - 1 });
  } catch (error) {
    return fail(error);
  }
});