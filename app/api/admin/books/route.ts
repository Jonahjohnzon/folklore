/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/admin/books/route.ts
import { NextRequest } from "next/server";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { Book } from "@/app/api/lib/models/Book";
import { ok, fail } from "@/app/api/response";
import { withAdmin } from "../withAdmin";

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const GET = withAdmin(async (req: NextRequest) => {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(50, Number(searchParams.get("limit")) || 20);

    const filter: Record<string, unknown> = {};
    if (q) filter.title = { $regex: escapeRegex(q), $options: "i" };

    const [books, total] = await Promise.all([
      Book.find(filter)
        .populate("authorId", "username displayName email")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Book.countDocuments(filter),
    ]);

    return ok({
      books: books.map((b) => ({
        _id: String(b._id),
        title: b.title,
        slug: b.slug,
        status: b.status,
        coverUrl: b.coverUrl ?? null,
        totalChapters: b.totalChapters,
        totalReads: b.totalReads,
        createdAt: b.createdAt,
        // populate() replaces authorId with the full doc at runtime, hence the cast
        author: b.authorId
          ? {
              _id: String((b.authorId as any)._id),
              username: (b.authorId as any).username,
              displayName: (b.authorId as any).displayName,
              email: (b.authorId as any).email,
            }
          : null,
      })),
      total,
      page,
      hasMore: page * limit < total,
    });
  } catch (error) {
    return fail(error);
  }
});