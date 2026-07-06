// app/api/admin/stats/route.ts
import { withAdmin } from "@/app/api/admin/withAdmin";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { User } from "@/app/api/lib/models/User";
import { Book } from "@/app/api/lib/models/Book";
import { ok, fail } from "@/app/api/response";

export const GET = withAdmin(async () => {
  try {
    await connectToDatabase();
    const [totalUsers, activeCreators, totalBooks, suspendedUsers] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ creatorStatus: "active" }),
      Book.countDocuments({}),
      User.countDocuments({ status: "suspended" }),
    ]);
    return ok({ stats: { totalUsers, activeCreators, totalBooks, suspendedUsers } });
  } catch (error) {
    return fail(error);
  }
});