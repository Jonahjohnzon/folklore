/* eslint-disable @typescript-eslint/no-explicit-any */
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { Book } from "@/app/api/lib/models/Book";
import { ok, fail } from "@/app/api/response";
import { NotFoundError } from "@/app/api/lib/db/errors";
import "@/app/api/lib/models/User";
import "@/app/api/lib/models/Book";
import "@/app/api/lib/models/Chapter";
import "@/app/api/lib/models/Tag";
import "@/app/api/lib/models/ParagraphComment";
import "@/app/api/lib/models/ChapterCommentCount";
// ...every model you have

const VISIBLE_STATUSES = ["ongoing", "completed", "hiatus"];

// Public: reading a book's detail page doesn't require auth.
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await connectToDatabase();
    const { slug } = await params;
    const book = await Book.findOne({ slug: slug, status: { $in: VISIBLE_STATUSES } })
      .populate({ path: "authorId", select: "penName avatarUrl followerCount username" })
      .populate({ path: "tags", select: "name slug" })
      .lean();

    if (!book) throw new NotFoundError("Book not found");

    const author = book.authorId as any;
    const tags = (book.tags ?? []) as any[];

    return ok({
      book: {
        _id: String(book._id),
        slug: book.slug,
        title: book.title,
        description: book.description ?? "",
        coverUrl: book.coverUrl ?? null,
        status: book.status,
        matureContent: book.matureContent,
        totalReads: book.totalReads,
        totalChapters: book.totalChapters,
        averageRating: book.averageRating,
        reviewCount: book.reviewCount,
        tags: tags.map((t) => ({ id: String(t._id), name: t.name, slug: t.slug })),
        author: {
          id: String(author?._id),
          penName: author?.penName ?? "Unknown",
          avatarUrl: author?.avatarUrl ?? null,
          followers: author?.followerCount ?? 0,
          username: author?.username ?? "",
        },
      },
    });
  } catch (error) {
    return fail(error);
  }
}