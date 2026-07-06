import { withAuth } from "@/app/api/auth/withAuth";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { Book } from "@/app/api/lib/models/Book";
import { Chapter } from "@/app/api/lib/models/Chapter";
import { updateChapterSchema } from "@/app/api/validation/chapter.schema";
import { ok, fail } from "@/app/api/response";
import { ValidationError, NotFoundError, ForbiddenError } from "@/app/api/lib/db/errors";

function wordsIn(html?: string) {
  if (!html) return 0;
  const text = html.replace(/<[^>]*>/g, " ").trim();
  return text ? text.split(/\s+/).length : 0;
}

async function loadOwnedChapter(bookId: string | string[], chapterId: string | string[], userId: string) {
  const book = await Book.findById(bookId);
  if (!book) throw new NotFoundError("Book not found");
  if (String(book.authorId) !== String(userId)) {
    throw new ForbiddenError("You don't have access to this book");
  }
  const chapter = await Chapter.findOne({ _id: chapterId, bookId });
  if (!chapter) throw new NotFoundError("Chapter not found");
  return { book, chapter };
}

export const GET = withAuth(async (req, ctx) => {
  try {
    await connectToDatabase();
    const { bookId, chapterId } = await ctx.params;
    const { chapter } = await loadOwnedChapter(bookId, chapterId, req.user.sub);
    return ok({ chapter });
  } catch (error) {
    return fail(error);
  }
});

export const PATCH = withAuth(async (req, ctx) => {
  try {
    await connectToDatabase();
    const { bookId, chapterId } = await ctx.params;
    const { chapter } = await loadOwnedChapter(bookId, chapterId, req.user.sub);

    const body = await req.json();
    
    const parsed = updateChapterSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError("Invalid input", parsed.error.flatten().fieldErrors);
    }
   
    Object.assign(chapter, parsed.data);
    if (parsed.data.content !== undefined) {
      chapter.wordCount = wordsIn(parsed.data.content);
    }
    if (chapter.accessType !== "coins") {
      chapter.coinsRequired = 0;
    }
    await chapter.save();

    return ok({ chapter });
  } catch (error) {
    return fail(error);
  }
});

export const DELETE = withAuth(async (req, ctx) => {
  try {
    await connectToDatabase();
    const { bookId, chapterId } = await ctx.params;
    const { book, chapter } = await loadOwnedChapter(bookId, chapterId, req.user.sub);
    await chapter.deleteOne();
    book.totalChapters = Math.max(0, book.totalChapters - 1);
    await book.save();
    return ok({ success: true });
  } catch (error) {
    return fail(error);
  }
});