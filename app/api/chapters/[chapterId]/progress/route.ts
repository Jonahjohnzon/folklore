import { withAuth } from "@/app/api/auth/withAuth";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { Chapter } from "@/app/api/lib/models/Chapter";
import { Book } from "@/app/api/lib/models/Book";
import { ReadingProgress } from "@/app/api/lib/models/ReadingProgress";
import { LibraryEntry } from "@/app/api/lib/models/LibraryEntry";
import { ok, fail } from "@/app/api/response";
import { NotFoundError } from "@/app/api/lib/db/errors";

export const POST = withAuth(async (req, ctx) => {
  try {
    await connectToDatabase();
    const { chapterId } = await ctx.params;

    const body = await req.json().catch(() => null);
    const progressPct =
      typeof body?.progressPct === "number" ? Math.min(100, Math.max(0, body.progressPct)) : 0;
    const completed = Boolean(body?.completed);

    const chapter = await Chapter.findById(chapterId).select("orderIndex title bookId").lean();
    if (!chapter) throw new NotFoundError("Chapter not found");

    const book = await Book.findById(chapter.bookId).select("title slug coverUrl totalChapters").lean();
    if (!book) throw new NotFoundError("Book not found");

    const now = new Date();

    await ReadingProgress.findOneAndUpdate(
      { userId: req.user.sub, chapterId },
      {
        $set: {
          bookId: chapter.bookId,
          chapterOrderIndex: chapter.orderIndex,
          chapterTitle: chapter.title,
          bookTitle: book.title,
          bookSlug: book.slug,
          bookCoverUrl: book.coverUrl ?? null,
          totalChapters: book.totalChapters ?? 0,
          progressPct,
          completed,
          lastReadAt: now,
        },
      },
      { upsert: true }
    );

    // Shelf auto-management: starting a book that isn't shelved yet (or was
    // only "want to read") moves it to "reading". Finishing the final
    // chapter moves it to "completed" — unless the reader had explicitly
    // dropped it, which we don't want to silently override.
    const existingEntry = await LibraryEntry.findOne({ userId: req.user.sub, bookId: chapter.bookId });
    const isLastChapter = book.totalChapters > 0 && chapter.orderIndex >= book.totalChapters;

    let nextStatus: string | null = null;
    if (!existingEntry) {
      nextStatus = "reading";
    } else if (existingEntry.status === "want_to_read") {
      nextStatus = "reading";
    } else if (completed && isLastChapter && existingEntry.status !== "dropped") {
      nextStatus = "completed";
    }

    if (nextStatus) {
      await LibraryEntry.findOneAndUpdate(
        { userId: req.user.sub, bookId: chapter.bookId },
        { $set: { status: nextStatus }, $setOnInsert: { addedAt: now } },
        { upsert: true }
      );
    }

    return ok({ saved: true, libraryStatus: nextStatus ?? existingEntry?.status ?? null });
  } catch (error) {
    return fail(error);
  }
});