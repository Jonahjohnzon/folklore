import { withAuth } from "@/app/api/auth/withAuth";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { Book } from "@/app/api/lib/models/Book";
import { BookTheme } from "@/app/api/lib/models/BookTheme";
import { createBookSchema } from "@/app/api/validation/book.schema";
import { ok, fail } from "@/app/api/response";
import { ValidationError } from "@/app/api/lib/db/errors";
import { resolveTagIds } from "@/app/api/lib/tags";

function slugify(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 80);
}

async function generateUniqueSlug(title: string) {
  const base = slugify(title) || "book";
  let slug = base;
  let n = 1;
  while (await Book.exists({ slug })) {
    slug = `${base}-${n++}`;
  }
  return slug;
}

export const POST = withAuth(async (req) => {
  try {
    await connectToDatabase();

    const body = await req.json();

    const parsed = createBookSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError("Invalid input", parsed.error.flatten().fieldErrors);
    }

    const slug = await generateUniqueSlug(parsed.data.title);
    const status = parsed.data.status ?? "draft";
    const tagIds = parsed.data.tags?.length ? await resolveTagIds(parsed.data.tags) : [];

    const book = await Book.create({
      authorId: req.user.sub,
      title: parsed.data.title,
      slug,
      description: parsed.data.description,
      language: parsed.data.language ?? "en",
      status,
      matureContent: parsed.data.matureContent ?? false,
      tags: tagIds,
      ...(status !== "draft" ? { publishedAt: new Date() } : {}),
    });

    // Give every book a theme document with defaults right away so the
    // editor/reader never has to special-case "no theme yet".
    await BookTheme.create({ bookId: book._id });

    return ok({ book });
  } catch (error) {
    return fail(error);
  }
});

export const GET = withAuth(async (req) => {
  try {
    await connectToDatabase();
    const books = await Book.find({ authorId: req.user.sub }).sort({ updatedAt: -1 }).lean();
    return ok({ books });
  } catch (error) {
    return fail(error);
  }
});