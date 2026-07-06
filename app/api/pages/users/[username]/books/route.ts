import { withAuth } from "@/app/api/auth/withAuth";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { Book } from "@/app/api/lib/models/Book";
import { User } from "@/app/api/lib/models/User";
import { ok, fail } from "@/app/api/response";
import { NotFoundError } from "@/app/api/lib/db/errors";

async function resolveUser(username: string | string[]) {
  const user = await User.findOne({ username })
    .select("_id username displayName creatorStatus")
    .lean();
  if (!user) throw new NotFoundError("User not found");
  if (user.creatorStatus !== "active") throw new NotFoundError("Author not found");
  return user;
}

export const GET = withAuth(async (req, ctx) => {
  try {
    await connectToDatabase();
    const { username } = await ctx.params;
    const user = await resolveUser(username);

    const isOwner = String(req.user.sub) === String(user._id);

    const statusFilter = isOwner
      ? { $in: ["draft", "ongoing", "completed", "hiatus"] }
      : { $in: ["ongoing", "completed", "hiatus"] };

    const books = await Book.find({
      authorId: user._id,
      status: statusFilter,
    })
      .sort({ publishedAt: -1, createdAt: -1 })
      .lean();

    const penName = user.displayName || user.username;

    return ok({
      books: books.map((b) => ({
        _id: String(b._id),
        title: b.title,
        slug: b.slug,
        coverUrl: b.coverUrl ?? null,
        matureContent: b.matureContent,
        totalReads: b.totalReads,
        totalChapters: b.totalChapters,
        averageRating: b.averageRating,
        reviewCount: b.reviewCount,
        status: b.status,
        author: {
          username: user.username,
          penName,
        },
      })),
    });
  } catch (error) {
    return fail(error);
  }
});