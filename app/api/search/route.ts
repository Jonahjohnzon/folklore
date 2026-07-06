// app/api/search/route.ts
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { Book } from "@/app/api/lib/models/Book";
import { User } from "@/app/api/lib/models/User";
import { Tag } from "@/app/api/lib/models/Tag";
import { ok, fail } from "@/app/api/response";
import { optionalAuth } from "@/app/api/auth/optionalAuth"; // public endpoint, no auth required either way

const VISIBLE_STATUSES = ["ongoing", "completed", "hiatus"];
const RESULT_LIMIT = 5;

function escapeRegex(str: string) {
  // Prevents a user typing regex special chars (e.g. "a(b" ) from throwing
  // a MongoDB regex compile error or doing something unintended.
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const GET = optionalAuth(async (req) => {
  try {
    const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
    if (q.length < 2) {
      return ok({ books: [], authors: [], tags: [] });
    }

    await connectToDatabase();
    const pattern = new RegExp(escapeRegex(q), "i");

    const [books, authors, tags] = await Promise.all([
      Book.find({ status: { $in: VISIBLE_STATUSES }, title: pattern })
        .select("title slug coverUrl authorId")
        .limit(RESULT_LIMIT)
        .populate("authorId", "penName username")
        .lean(),

      User.find({
        status: "active",
        $or: [{ username: pattern }, { displayName: pattern }, { penName: pattern }],
      })
        .select("username displayName avatarUrl penName creatorStatus")
        .limit(RESULT_LIMIT)
        .lean(),

      Tag.find({ name: pattern })
        .select("name slug category")
        .sort({ usageCount: -1 })
        .limit(RESULT_LIMIT)
        .lean(),
    ]);

    return ok({
      books: books.map((b) => {
        const author = b.authorId as unknown as { penName?: string; username: string } | null;
        return {
          _id: String(b._id),
          title: b.title,
          slug: b.slug,
          coverUrl: b.coverUrl ?? null,
          authorName: author?.penName ?? author?.username ?? "Unknown",
        };
      }),
      authors: authors.map((u) => ({
        username: u.username,
        displayName: u.displayName ?? u.username,
        avatarUrl: u.avatarUrl ?? null,
        penName: u.penName ?? null,
        isCreator: u.creatorStatus === "active",
      })),
      tags: tags.map((t) => ({
        name: t.name,
        slug: t.slug,
        category: t.category,
      })),
    });
  } catch (error) {
    return fail(error);
  }
});