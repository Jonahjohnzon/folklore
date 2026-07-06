// app/api/creator/books/[bookId]/route.ts
import { withAuth } from "@/app/api/auth/withAuth";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { Book } from "@/app/api/lib/models/Book";
import { Chapter } from "@/app/api/lib/models/Chapter";
import { Review } from "@/app/api/lib/models/Reviews";
import { ok, fail } from "@/app/api/response";
import { NotFoundError, ForbiddenError } from "@/app/api/lib/db/errors";
import '@/app/api/lib/models/Tag'

export const GET = withAuth(async (req, ctx) => {
  try {
    await connectToDatabase();
    const { bookId } = await ctx.params;

    const book = await Book.findById(bookId)
      .populate("tags", "name slug") // tags are ObjectId refs to Tag, not plain strings
      .lean();
    if (!book) throw new NotFoundError("Book not found");
    if (String(book.authorId) !== req.user.sub) throw new ForbiddenError("Not your book");

    const chapters = await Chapter.find({ bookId })
      .select("title orderIndex wordCount publishedAt accessType coinsRequired")
      .sort({ orderIndex: 1 })
      .lean();

    const reviews = await Review.find({ bookId })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("userId", "username avatarUrl")
      .lean();

    // Populated tags come back as {_id, name, slug} objects. The edit form's
    // genre picker works off plain label strings (matches GENRES), so map
    // down to names here rather than pushing object-shaped tags into a
    // component built for strings.
    const tagNames = (book.tags as unknown as { name: string }[] | undefined)?.map((t) => t.name) ?? [];

    return ok({
      book: {
        _id: String(book._id),
        title: book.title,
        slug: book.slug,
        description: book.description ?? "",
        coverUrl: book.coverUrl ?? null,
        coverPublicId: book.coverPublicId ?? null,
        status: book.status,
        language: book.language,
        matureContent: book.matureContent ?? false,
        tags: tagNames,
        totalReads: book.totalReads ?? 0,
        totalChapters: book.totalChapters ?? 0,
        averageRating: book.averageRating ?? 0,
        reviewCount: book.reviewCount ?? 0,
      },
      chapters: chapters.map((c) => ({
        _id: String(c._id),
        title: c.title,
        orderIndex: c.orderIndex,
        wordCount: c.wordCount ?? 0,
        publishedAt: c.publishedAt ?? null,
        accessType: c.accessType,
        coinsRequired: c.coinsRequired ?? 0,
      })),
      reviews: reviews.map((r) => {
        const user = r.userId as unknown as { username: string; avatarUrl?: string } | null;
        return {
          id: String(r._id),
          username: user?.username ?? "Deleted user",
          avatarUrl: user?.avatarUrl ?? null,
          rating: r.rating,
          body: r.body,
          createdAt: r.createdAt,
        };
      }),
    });
  } catch (error) {
    return fail(error);
  }
});