import { connectToDatabase } from "@/app/api/lib/db/connect";
import { Book } from "@/app/api/lib/models/Book";
import { Chapter } from "@/app/api/lib/models/Chapter";
import { ok, fail } from "@/app/api/response";
import { NotFoundError } from "@/app/api/lib/db/errors";

const VISIBLE_STATUSES = ["ongoing", "completed", "hiatus"];

export async function GET(_req: Request,{ params }: { params: Promise<{ slug: string }> }) {
  try {
    await connectToDatabase();
    const { slug } = await params;
    const book = await Book.findOne({ slug: slug, status: { $in: VISIBLE_STATUSES } })
      .select("_id")
      .lean();
    if (!book) throw new NotFoundError("Book not found");

    // Only published chapters show up in the public TOC.
    const chapters = await Chapter.find({ bookId: book._id, publishedAt: { $ne: null } })
      .select("orderIndex title wordCount accessType coinsRequired")
      .sort({ orderIndex: 1 })
      .lean();

    return ok({
      chapters: chapters.map((c) => ({
        _id: String(c._id),
        orderIndex: c.orderIndex,
        title: c.title,
        wordCount: c.wordCount,
        accessType: c.accessType,
        coinsRequired: c.coinsRequired,
      })),
    });
  } catch (error) {
    return fail(error);
  }
}