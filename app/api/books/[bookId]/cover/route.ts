// app/api/books/[bookId]/cover/route.ts
import { withAuth } from "@/app/api/auth/withAuth";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { Book } from "@/app/api/lib/models/Book";
import { ok, fail } from "@/app/api/response";
import { NotFoundError, ForbiddenError, ValidationError } from "@/app/api/lib/db/errors";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

function uploadBuffer(buffer: Buffer, folder: string): Promise<{ secure_url: string; public_id: string }> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (err, result) => {
      if (err || !result) return reject(err ?? new Error("Upload failed"));
      resolve({ secure_url: result.secure_url, public_id: result.public_id });
    });
    stream.end(buffer);
  });
}

export const PATCH = withAuth(async (req, ctx) => {
  try {
    await connectToDatabase();

    const { bookId } = await ctx.params;
    const book = await Book.findById(bookId);
    if (!book) throw new NotFoundError("Book not found");
    if (String(book.authorId) !== String(req.user.sub)) {
      throw new ForbiddenError("You don't have access to this book");
    }

    const form = await req.formData();
    const file = form.get("cover");
    if (!(file instanceof File)) {
      throw new ValidationError("No image provided", { cover: ["A cover image is required"] });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new ValidationError("Unsupported image type", { cover: ["Use JPG, PNG, or WEBP"] });
    }
    if (file.size > MAX_BYTES) {
      throw new ValidationError("image too large", { cover: ["Max size is 8MB"] });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadBuffer(buffer, `books/${book._id}/cover`);

    const oldPublicId = book.coverPublicId;

    book.coverUrl = result.secure_url;
    book.coverPublicId = result.public_id;
    await book.save();

    if (oldPublicId && oldPublicId !== result.public_id) {
      try {
        await cloudinary.uploader.destroy(oldPublicId);
      } catch (cleanupErr) {
        console.error("Failed to delete old cover from Cloudinary:", cleanupErr);
      }
    }

    return ok({ coverUrl: book.coverUrl, coverPublicId: book.coverPublicId });
  } catch (error) {
    return fail(error);
  }
});