// app/api/admin/badges/route.ts — add POST alongside existing GET
import { withAdmin } from "@/app/api/admin/withAdmin";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { Badge } from "@/app/api/lib/models/Badge";
import { ok, fail } from "@/app/api/response";
import { ValidationError } from "@/app/api/lib/db/errors";

export const GET = withAdmin(async () => {
  try {
    await connectToDatabase();
    const badges = await Badge.find({}).sort({ category: 1, tier: 1 }).lean();
    return ok({ badges });
  } catch (error) {
    return fail(error);
  }
});

export const POST = withAdmin(async (req) => {
  try {
    await connectToDatabase();
    const { key, category, tier, name, threshold } = await req.json();

    if (!key || !category || !name) throw new ValidationError("key, category, and name are required");
    if (!["reading_milestone", "streak"].includes(category)) throw new ValidationError("Invalid category");
    if (!Number.isInteger(tier) || tier < 1 || tier > 5) throw new ValidationError("tier must be 1-5");
    if (!Number.isInteger(threshold) || threshold < 1) throw new ValidationError("threshold must be a positive integer");

    const existing = await Badge.findOne({ key });
    if (existing) throw new ValidationError("A badge with this key already exists");

    const badge = await Badge.create({ key, category, tier, name, threshold, active: true });
    return ok({ badge });
  } catch (error) {
    return fail(error);
  }
});