// app/api/admin/sounds/route.ts
import { withAdmin } from "@/app/api/admin/withAdmin";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { Sound } from "@/app/api/lib/models/Sound";
import { ok, fail } from "@/app/api/response";

const CATEGORIES = ["ambience", "impact", "nature", "music_sting"];

export const GET = withAdmin(async () => {
  try {
    await connectToDatabase();
    const sounds = await Sound.find().sort({ category: 1, createdAt: -1 }).lean();
    return ok({ sounds });
  } catch (error) {
    return fail(error);
  }
});

export const POST = withAdmin(async (req) => {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { label, category, url } = body ?? {};

    if (!label || typeof label !== "string" || !label.trim()) {
      return fail(new Error("Label is required."));
    }
    if (!CATEGORIES.includes(category)) {
      return fail(new Error("Invalid category."));
    }
    if (!url || typeof url !== "string" || !url.trim()) {
      return fail(new Error("Sound URL is required."));
    }

    const sound = await Sound.create({
      label: label.trim(),
      category,
      url: url.trim(),
    });

    return ok({ sound });
  } catch (error) {
    return fail(error);
  }
});