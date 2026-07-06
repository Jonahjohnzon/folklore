// app/api/creator/dashboard/route.ts
import { withAuth } from "@/app/api/auth/withAuth";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { Book } from "@/app/api/lib/models/Book";
import { Follow } from "@/app/api/lib/models/Follow";
import { ok, fail } from "@/app/api/response";

export const GET = withAuth(async (req) => {
  try {
    await connectToDatabase();

    const [books, followerCount] = await Promise.all([
      Book.find({ authorId: req.user.sub })
        .select("title slug coverUrl status totalReads totalChapters averageRating reviewCount updatedAt")
        .sort({ updatedAt: -1 })
        .lean(),
      Follow.countDocuments({ targetType: "author", authorId: req.user.sub }),
    ]);

    const totalReads = books.reduce((sum, b) => sum + (b.totalReads ?? 0), 0);
    const totalChapters = books.reduce((sum, b) => sum + (b.totalChapters ?? 0), 0);

    const ratedBooks = books.filter((b) => (b.reviewCount ?? 0) > 0);
    const totalReviewCount = ratedBooks.reduce((sum, b) => sum + (b.reviewCount ?? 0), 0);
    const avgRating =
      totalReviewCount > 0
        ? ratedBooks.reduce((sum, b) => sum + (b.averageRating ?? 0) * (b.reviewCount ?? 0), 0) /
          totalReviewCount
        : 0;

    return ok({
      stats: {
        totalReads,
        totalChapters,
        totalBooks: books.length,
        avgRating: Math.round(avgRating * 10) / 10,
        followerCount,
      },
      books: books.map((b) => ({
        _id: String(b._id),
        title: b.title,
        slug: b.slug,
        coverUrl: b.coverUrl ?? null,
        status: b.status,
        totalReads: b.totalReads ?? 0,
        totalChapters: b.totalChapters ?? 0,
        averageRating: b.averageRating ?? 0,
        reviewCount: b.reviewCount ?? 0,
        updatedAt: b.updatedAt,
      })),
    });
  } catch (error) {
    return fail(error);
  }
});