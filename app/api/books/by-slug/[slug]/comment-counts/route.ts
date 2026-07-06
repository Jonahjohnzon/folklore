import { connectToDatabase } from "@/app/api/lib/db/connect";
import { Book } from "@/app/api/lib/models/Book";
import { Chapter } from "@/app/api/lib/models/Chapter";
import { ChapterCommentCount } from "@/app/api/lib/models/ChapterCommentCount";
import { ok, fail } from "@/app/api/response";
import { NotFoundError } from "@/app/api/lib/db/errors";

// NOTE — two assumptions made here that I can't verify without your models:
// 1. `Chapter` documents have a `bookId` field pointing back to their Book.
//    If the field is named something else (e.g. `book`), swap it below.
// 2. The response shape is a map of chapterId -> total comment count for
//    that chapter. If the frontend actually expects a single book-wide
//    total instead, let me know and this collapses to one number.
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await connectToDatabase();
    const { slug } = await params;

    const book = await Book.findOne({ slug }).select("_id").lean();
    if (!book) throw new NotFoundError("Book not found");

    const chapters = await Chapter.find({ bookId: book._id }).select("_id").lean();
    const chapterIds = chapters.map((c) => c._id);

    const docs = await ChapterCommentCount.find({ chapterId: { $in: chapterIds } }).lean();

    const counts: Record<string, number> = {};
    for (const doc of docs) {
      const perStatusCounts = (doc.counts as Record<string, number>) ?? {};
      const total = Object.values(perStatusCounts).reduce((sum, n) => sum + n, 0);
      counts[String(doc.chapterId)] = total;
    }

    return ok({ counts });
  } catch (error) {
    return fail(error);
  }
}