// app/api/books/route.ts
import { withAuth } from "@/app/api/auth/withAuth";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { Book } from "@/app/api/lib/models/Book";
import { BookTheme } from "@/app/api/lib/models/BookTheme";
import { createBookSchema } from "@/app/api/validation/book.schema";
import { ok, fail } from "@/app/api/response";
import { ValidationError } from "@/app/api/lib/db/errors";
import { resolveTagIds } from "@/app/api/lib/tags";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

// Wraps Book.create with a retry against slug collisions. The pre-check in
// generateUniqueSlug narrows the window but doesn't close it — this catches
// the DB-level unique index rejection (E11000) if two requests race.
async function createBookWithUniqueSlug(
  payload: Omit<Parameters<typeof Book.create>[0], "slug">,
  baseTitle: string
) {
  const base = slugify(baseTitle) || "book";
  let slug = await generateUniqueSlug(baseTitle);

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await Book.create({ ...payload, slug });
    } catch (err: any) {
      if (err?.code === 11000 && err?.keyPattern?.slug) {
        slug = `${base}-${Date.now().toString(36).slice(-4)}`;
        continue;
      }
      throw err;
    }
  }
  throw new Error("Could not generate a unique slug after several attempts");
}

export const POST = withAuth(async (req) => {
  try {
    await connectToDatabase();

    const body = await req.json();

    const parsed = createBookSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError("Invalid input", parsed.error.flatten().fieldErrors);
    }

    const status = parsed.data.status ?? "draft";
    const tagIds = parsed.data.tags?.length ? await resolveTagIds(parsed.data.tags) : [];

    const book = await createBookWithUniqueSlug(
      {
        authorId: req.user.sub,
        title: parsed.data.title,
        description: parsed.data.description,
        language: parsed.data.language ?? "en",
        status,
        matureContent: parsed.data.matureContent ?? false,
        tags: tagIds,
        coverUrl: parsed.data.coverUrl,
        coverPublicId: parsed.data.coverPublicId,
        ...(status !== "draft" ? { publishedAt: new Date() } : {}),
      },
      parsed.data.title
    );

    // If the cover was uploaded to the pre-create staging folder, move it
    // into the book's own folder. Best-effort: the staging URL still works
    // fine on its own, so a failure here shouldn't fail book creation.
    if (parsed.data.coverPublicId?.startsWith(`books/staging/${req.user.sub}/`)) {
      try {
        const renamed = await cloudinary.uploader.rename(
          parsed.data.coverPublicId,
          `books/${book._id}/cover/${parsed.data.coverPublicId.split("/").pop()}`
        );
        book.coverUrl = renamed.secure_url;
        book.coverPublicId = renamed.public_id;
        await book.save();
      } catch (err) {
        console.error("Failed to relocate staged cover:", err);
      }
    }

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