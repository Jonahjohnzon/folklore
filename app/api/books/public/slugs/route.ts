// app/api/books/public/slugs/route.ts
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { Book } from "@/app/api/lib/models/Book";
import { ok, fail } from "@/app/api/response";

// Public, unauthenticated — used to build the sitemap. Only ever returns
// books that should actually be indexable: published/ongoing/completed/
// hiatus, never drafts or removed books. No pagination since this is
// meant to be consumed in full by generateMetadata/sitemap build steps,
// not by a UI.
export const GET = async () => {
  try {
    await connectToDatabase();

    const books = await Book.find({
      status: { $in: ["ongoing", "completed", "hiatus"] },
    })
      .select("slug updatedAt")
      .sort({ updatedAt: -1 })
      .lean();

    return ok({
      books: books.map((b) => ({
        slug: b.slug,
        updatedAt: b.updatedAt,
      })),
    });
  } catch (error) {
    return fail(error);
  }
};