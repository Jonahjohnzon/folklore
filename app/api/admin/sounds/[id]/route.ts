// app/api/admin/sounds/[id]/route.ts
import { withAdmin } from "@/app/api/admin/withAdmin";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { Sound } from "@/app/api/lib/models/Sound";
import { ok, fail } from "@/app/api/response";

const CATEGORIES = ["ambience", "impact", "nature", "music_sting"];

export const PATCH = withAdmin(async (req, ctx) => {
  try {
    await connectToDatabase();
    
    const body = await req.json();
    const {id} = await ctx.params
    const update: Record<string, unknown> = {};
    if (typeof body.label === "string" && body.label.trim()) update.label = body.label.trim();
    if (typeof body.category === "string") {
      if (!CATEGORIES.includes(body.category)) return fail(new Error("Invalid category."));
      update.category = body.category;
    }
    if (typeof body.url === "string" && body.url.trim()) update.url = body.url.trim();
    if (typeof body.active === "boolean") update.active = body.active;

    const sound = await Sound.findByIdAndUpdate(id, update, { new: true });
    if (!sound) return fail(new Error("Sound not found."));
    return ok({ sound });
  } catch (error) {
    return fail(error);
  }
});

export const DELETE = withAdmin(async (_req,ctx) => {
  try {
    await connectToDatabase();
    const {id} = await ctx.params
    const deleted = await Sound.findByIdAndDelete(id);
    if (!deleted) return fail(new Error("Sound not found."));
    return ok({ deleted: true });
  } catch (error) {
    return fail(error);
  }
});