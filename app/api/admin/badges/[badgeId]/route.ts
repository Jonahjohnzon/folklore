// app/api/admin/badges/[badgeId]/route.ts — widen PATCH beyond just `active`
import { withAdmin } from "@/app/api/admin/withAdmin";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { Badge } from "@/app/api/lib/models/Badge";
import { ok, fail } from "@/app/api/response";
import { NotFoundError, ValidationError } from "@/app/api/lib/db/errors";

export const PATCH = withAdmin(async (req, ctx) => {
  try {
    await connectToDatabase();
    const { badgeId } = await ctx.params;
    const body = await req.json();

    const update: Record<string, unknown> = {};
    if (typeof body.active === "boolean") update.active = body.active;
    if (typeof body.name === "string" && body.name.trim()) update.name = body.name.trim();
    if (Number.isInteger(body.threshold) && body.threshold > 0) update.threshold = body.threshold;

    if (Object.keys(update).length === 0) throw new ValidationError("No valid fields to update");

    const badge = await Badge.findByIdAndUpdate(badgeId, update, { new: true });
    if (!badge) throw new NotFoundError("Badge not found");

    return ok({ badge });
  } catch (error) {
    return fail(error);
  }
});