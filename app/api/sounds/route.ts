// app/api/sounds/route.ts
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { Sound } from "@/app/api/lib/models/Sound";
import { ok, fail } from "@/app/api/response";

export async function GET() {
  try {
    await connectToDatabase();
    const sounds = await Sound.find({ active: true })
      .select("label category url")
      .sort({ category: 1, label: 1 })
      .lean();

    return ok({
      sounds: sounds.map((s) => ({
        id: String(s._id),
        label: s.label,
        category: s.category,
        url: s.url,
      })),
    });
  } catch (error) {
    return fail(error);
  }
}