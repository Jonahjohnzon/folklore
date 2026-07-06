import { withAuth } from "@/app/api/auth/withAuth";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { Book } from "@/app/api/lib/models/Book";
import { Chapter } from "@/app/api/lib/models/Chapter";
import { createChapterSchema } from "@/app/api/validation/chapter.schema";
import { ok, fail } from "@/app/api/response";
import { NotFoundError, ForbiddenError, ValidationError } from "@/app/api/lib/db/errors";

function wordsIn(html?: string) {
  if (!html) return 0;
  const text = html.replace(/<[^>]*>/g, " ").trim();
  return text ? text.split(/\s+/).length : 0;
}

export const POST = withAuth(async (req, ctx) => {
  try {
    await connectToDatabase();

    const { bookId } = await ctx.params;
    const book = await Book.findById(bookId);
    if (!book) throw new NotFoundError("Book not found");
    if (String(book.authorId) !== String(req.user.sub)) {
      throw new ForbiddenError("You don't have access to this book");
    }

    const body = await req.json();
    const parsed = createChapterSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError("Invalid input", parsed.error.flatten().fieldErrors);
    }

    let orderIndex = parsed.data.orderIndex;
    if (orderIndex === undefined) {
      const last = await Chapter.findOne({ bookId: book._id }).sort({ orderIndex: -1 }).lean();
      orderIndex = last ? last.orderIndex + 1 : 1;
    }

    const accessType = parsed.data.accessType ?? "free";

    const chapter = await Chapter.create({
      bookId: book._id,
      orderIndex,
      title: parsed.data.title,
      content: parsed.data.content ?? "",
      wordCount: wordsIn(parsed.data.content),
      accessType,
      coinsRequired: accessType === "coins" ? parsed.data.coinsRequired ?? 0 : 0,
    });

    book.totalChapters += 1;
    await book.save();

    return ok({ chapter });
  } catch (error) {
    return fail(error);
  }
});

export const GET = withAuth(async (req, ctx) => {
  try {
    await connectToDatabase();
    const { bookId } = await ctx.params;
    const chapters = await Chapter.find({ bookId }).sort({ orderIndex: 1 }).lean();
    return ok({ chapters });
  } catch (error) {
    return fail(error);
  }
});