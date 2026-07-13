// app/api/admin/promo-banners/route.ts
import { z } from "zod";
import { withAdmin } from "@/app/api/admin/withAdmin";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { PromoBanner } from "@/app/api/lib/models/PromoBanner";
import { ok, fail } from "@/app/api/response";
import { ValidationError } from "@/app/api/lib/db/errors";

const bookSchema = z.object({
  title: z.string().trim().min(1),
  coverUrl: z.string().trim().min(1),
  href: z.string().trim().min(1),
});

const bodySchema = z.object({
  type: z.enum(["books", "announcement"]),
  heading: z.string().trim().min(1),
  accent: z.string().trim().default(""),
  bgColor: z.string().trim().min(1),
  waveColor: z.string().trim().min(1),
  books: z.array(bookSchema).default([]),
  imageUrl: z.string().trim().optional(),
  linkUrl: z.string().trim().optional(),
  linkLabel: z.string().trim().optional(),
  openInNewTab: z.boolean().default(false),
  active: z.boolean().default(true),
  order: z.number().default(0),
  startsAt: z.string().datetime().optional().nullable(),
  endsAt: z.string().datetime().optional().nullable(),
});

export const GET = withAdmin(async () => {
  try {
    await connectToDatabase();
    const banners = await PromoBanner.find().sort({ order: 1, createdAt: -1 }).lean();
    return ok({ banners });
  } catch (error) {
    return fail(error);
  }
});

export const POST = withAdmin(async (req) => {
  try {
    await connectToDatabase();
    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      throw new ValidationError("Invalid banner", parsed.error.flatten().fieldErrors);
    }

    if (parsed.data.type === "announcement" && !parsed.data.linkUrl) {
      throw new ValidationError("Missing link", { linkUrl: ["Announcement banners need a destination link."] });
    }
    if (parsed.data.type === "books" && parsed.data.books.length === 0) {
      throw new ValidationError("Missing books", { books: ["Add at least one book to a books banner."] });
    }

    const banner = await PromoBanner.create(parsed.data);
    return ok({ banner });
  } catch (error) {
    return fail(error);
  }
});