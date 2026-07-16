// app/api/creator/chapters/[chapterId]/move/route.ts
import { withAuth } from "@/app/api/auth/withAuth";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { Book } from "@/app/api/lib/models/Book";
import { Chapter } from "@/app/api/lib/models/Chapter";
import { ok, fail } from "@/app/api/response";
import { NotFoundError, ForbiddenError } from "@/app/api/lib/db/errors";

export const POST = withAuth(async (req, ctx) => {
  try {
    await connectToDatabase();
    const { chapterId } = await ctx.params;
    const { direction } = await req.json();

    if (direction !== "up" && direction !== "down") {
      return fail({ status: 400, message: "direction must be 'up' or 'down'" });
    }

    const chapter = await Chapter.findById(chapterId);
    if (!chapter) throw new NotFoundError("Chapter not found");

    const book = await Book.findById(chapter.bookId);
    if (!book) throw new NotFoundError("Book not found");
    if (String(book.authorId) !== req.user.sub) throw new ForbiddenError("Not your book");

    const targetIndex = direction === "up" ? chapter.orderIndex - 1 : chapter.orderIndex + 1;
    const neighbor = await Chapter.findOne({ bookId: book._id, orderIndex: targetIndex });

    // already at the top/bottom — no-op, not an error
    if (!neighbor) return ok({ moved: false });

    // swap via a temp index to dodge a unique(bookId, orderIndex) collision mid-swap
    const originalIndex = chapter.orderIndex;
    await Chapter.updateOne({ _id: chapter._id }, { orderIndex: -1 });
    await Chapter.updateOne({ _id: neighbor._id }, { orderIndex: originalIndex });
    await Chapter.updateOne({ _id: chapter._id }, { orderIndex: targetIndex });

    return ok({
      moved: true,
      swapped: [
        { id: String(chapter._id), orderIndex: targetIndex },
        { id: String(neighbor._id), orderIndex: originalIndex },
      ],
    });
  } catch (error) {
    return fail(error);
  }
});