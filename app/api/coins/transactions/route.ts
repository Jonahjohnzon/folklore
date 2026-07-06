import { withAuth } from "@/app/api/auth/withAuth";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { Transaction } from "@/app/api/lib/models/Transaction";
import { ok, fail } from "@/app/api/response";
import { Types } from "mongoose";

const MAX_ENTRIES = 20;

export const GET = withAuth(async (req) => {
  try {
    await connectToDatabase();
    const items = await Transaction.find({ userId: new Types.ObjectId(req.user.sub) })
      .sort({ createdAt: -1 })
      .limit(MAX_ENTRIES)
      .lean();

    return ok(
      items.map((t) => ({
        id: String(t._id),
        label: t.label,
        coins: t.coins,
        date: new Date(t.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short" }),
      }))
    );
  } catch (error) {
    return fail(error);
  }
});