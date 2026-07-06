// app/api/admin/users/route.ts — paginated, searchable user list
import { withAdmin } from "@/app/api/admin/withAdmin";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { User } from "@/app/api/lib/models/User";
import { ok, fail } from "@/app/api/response";

export const GET = withAdmin(async (req) => {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") ?? 1);
    const q = searchParams.get("q")?.trim();

    const filter = q ? { $text: { $search: q } } : {};
    const [users, total] = await Promise.all([
      User.find(filter)
        .select("username displayName email status role creatorStatus createdAt")
        .sort({ createdAt: -1 })
        .skip((page - 1) * 20)
        .limit(20)
        .lean(),
      User.countDocuments(filter),
    ]);

    return ok({ users, total, page, hasMore: page * 20 < total });
  } catch (error) {
    return fail(error);
  }
});