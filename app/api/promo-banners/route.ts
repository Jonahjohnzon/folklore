// app/api/promo-banners/route.ts
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { PromoBanner } from "@/app/api/lib/models/PromoBanner";
import { ok, fail } from "@/app/api/response";

export async function GET() {
  try {
    await connectToDatabase();
    const now = new Date();

    const banners = await PromoBanner.find({
      active: true,
      $and: [
        { $or: [{ startsAt: { $exists: false } }, { startsAt: null }, { startsAt: { $lte: now } }] },
        { $or: [{ endsAt: { $exists: false } }, { endsAt: null }, { endsAt: { $gte: now } }] },
      ],
    })
      .sort({ order: 1, createdAt: -1 })
      .lean();

    return ok({
      banners: banners.map((b) => ({
        id: String(b._id),
        type: b.type,
        heading: b.heading,
        accent: b.accent,
        bgColor: b.bgColor,
        waveColor: b.waveColor,
        books: b.books ?? [],
        imageUrl: b.imageUrl ?? null,
        linkUrl: b.linkUrl ?? null,
        linkLabel: b.linkLabel ?? null,
        openInNewTab: b.openInNewTab,
      })),
    });
  } catch (error) {
    return fail(error);
  }
}