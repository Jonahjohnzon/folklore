// app/api/uploads/cover/route.ts
import { withAuth } from "@/app/api/auth/withAuth";
import { ok, fail } from "@/app/api/response";
import { ValidationError } from "@/app/api/lib/db/errors";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MAX_BYTES = 1 * 1024 * 1024;
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

// Uploads a cover before a book exists yet — used during the "create book" flow.
// The resulting public_id lives in a per-user staging folder so we can find
// and sweep orphans later (see note below) if the book create step never happens.
export const POST = withAuth(async (req) => {
  try {
    const form = await req.formData();
    const file = form.get("cover");
    if (!(file instanceof File)) {
      throw new ValidationError("No image provided", { cover: ["A cover image is required"] });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new ValidationError("Unsupported image type", { cover: ["Use JPG, PNG, or WEBP"] });
    }
    if (file.size > MAX_BYTES) {
      throw new ValidationError("Image too large", { cover: ["Max size is 1MB"] });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadBuffer(buffer, `books/staging/${req.user.sub}`);

    return ok({ coverUrl: result.secure_url, coverPublicId: result.public_id });
  } catch (error) {
    return fail(error);
  }
});