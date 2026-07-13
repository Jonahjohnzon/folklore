// app/api/admin/promo-banners/[id]/route.ts
import { withAdmin } from "@/app/api/admin/withAdmin";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { PromoBanner } from "@/app/api/lib/models/PromoBanner";
import { ok, fail } from "@/app/api/response";

export const PATCH = withAdmin(async (req, ctx) => {
  try {
    await connectToDatabase();
    const { id } = await ctx.params;
    const body = await req.json();
    const banner = await PromoBanner.findByIdAndUpdate(id, body, { new: true });
    if (!banner) return fail(new Error("Banner not found."));
    return ok({ banner });
  } catch (error) {
    return fail(error);
  }
});

export const DELETE = withAdmin(async (_req, ctx) => {
  try {
    await connectToDatabase();
    const { id } = await ctx.params;
    const deleted = await PromoBanner.findByIdAndDelete(id);
    if (!deleted) return fail(new Error("Banner not found."));
    return ok({ deleted: true });
  } catch (error) {
    return fail(error);
  }
});