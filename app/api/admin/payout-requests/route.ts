/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/admin/payout-requests/route.ts
import { withAdmin } from "@/app/api/admin/withAdmin";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { PayoutRequest } from "@/app/api/lib/models/PayoutRequest";
import { ok, fail } from "@/app/api/response";

export const GET = withAdmin(async (req) => {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") ?? 1);
    const status = searchParams.get("status");

    const filter: Record<string, unknown> = {};
    if (status && status !== "all") filter.status = status;

    const [requests, total] = await Promise.all([
      PayoutRequest.find(filter)
        .populate({ path: "userId", select: "username displayName email" })
        .sort({ createdAt: -1 })
        .skip((page - 1) * 20)
        .limit(20)
        .lean(),
      PayoutRequest.countDocuments(filter),
    ]);

    const rows = requests.map((r: any) => ({
      _id: String(r._id),
      user: {
        username: r.userId?.username ?? "unknown",
        displayName: r.userId?.displayName ?? "",
        email: r.userId?.email ?? "",
      },
      amountCoins: r.amountCoins,
      method: r.method,
      destinationSnapshot: r.destinationSnapshot,
      status: r.status,
      adminNote: r.adminNote ?? null,
      createdAt: r.createdAt,
      processedAt: r.processedAt ?? null,
    }));

    return ok({ requests: rows, total, page, hasMore: page * 20 < total });
  } catch (error) {
    return fail(error);
  }
});