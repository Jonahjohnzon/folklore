import { withAuth } from "@/app/api/auth/withAuth";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { Book } from "@/app/api/lib/models/Book";
import { updateBookSchema } from "@/app/api/validation/book.schema";
import { ok, fail } from "@/app/api/response";
import { ValidationError, NotFoundError, ForbiddenError } from "@/app/api/lib/db/errors";
import { Tag } from "@/app/api/lib/models/Tag";

function slugify(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, "-");
}

async function loadOwnedBook(bookId: string | string[], userId: string) {
  const book = await Book.findById(bookId);
  if (!book) throw new NotFoundError("Book not found");
  if (String(book.authorId) !== String(userId)) {
    throw new ForbiddenError("You don't have access to this book");
  }
  return book;
}

export const GET = withAuth(async (req, ctx) => {
  try {
    await connectToDatabase();
    const { bookId } = await ctx.params;
    const book = await loadOwnedBook(bookId, req.user.sub);
    return ok({ book });
  } catch (error) {
    return fail(error);
  }
});

export const PATCH = withAuth(async (req, ctx) => {
    try {
    await connectToDatabase();
    const { bookId } = await ctx.params;
    const book = await loadOwnedBook(bookId, req.user.sub);

    const body = await req.json();
    const parsed = updateBookSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError("Invalid input", parsed.error.flatten().fieldErrors);
    }

    const { tags: tagNames, ...rest } = parsed.data;

    Object.assign(book, rest);

    // tags arrives as plain genre-name strings (e.g. "Fantasy"), but the
    // schema stores [ObjectId] refs to Tag — resolve names to existing
    // Tag docs, creating any that don't exist yet, rather than casting
    // strings straight into the ref field.
    if (tagNames) {
      const tagIds = await Promise.all(
        tagNames.map(async (name) => {
          const trimmed = name.trim();
          const existing = await Tag.findOne({ name: trimmed });
          if (existing) return existing._id;
          const created = await Tag.create({ name: trimmed, slug: slugify(trimmed) });
          return created._id;
        })
      );
      book.tags = tagIds;
    }

    if (parsed.data.status && parsed.data.status !== "draft" && !book.publishedAt) {
      book.publishedAt = new Date();
    }
    await book.save();

    return ok({ book });
  } catch (error) {
    return fail(error);
  }
});

// app/api/books/[bookId]/route.ts
export const DELETE = withAuth(async (req, ctx) => {
  try {
    await connectToDatabase();
    const { bookId } = await ctx.params;

    const book = await Book.findById(bookId);
    if (!book) throw new NotFoundError("Book not found");
    if (String(book.authorId) !== req.user.sub) throw new ForbiddenError("Not your book");

    book.statusBeforeDelete = book.status;
    book.status = "removed";
    book.deletedAt = new Date();
    await book.save();

    return ok({ book });
  } catch (error) {
    return fail(error);
  }
});