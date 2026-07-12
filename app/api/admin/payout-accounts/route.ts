/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/admin/payout-accounts/route.ts
import { withAdmin } from "@/app/api/admin/withAdmin";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { PayoutAccount } from "@/app/api/lib/models/PayoutAccount";
import { User } from "@/app/api/lib/models/User";
import { decryptSecret, maskAccountNumber, maskWalletAddress } from "@/app/api/lib/server/payout-crypto";
import { ok, fail } from "@/app/api/response";

export const GET = withAdmin(async (req) => {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") ?? 1);
    const method = searchParams.get("method");
    const q = searchParams.get("q")?.trim();

    const filter: Record<string, unknown> = {};
    if (method === "bank" || method === "crypto") filter.method = method;
    if (q) {
      const users = await User.find({ $text: { $search: q } }).select("_id").lean();
      filter.userId = { $in: users.map((u) => u._id) };
    }

    const [accounts, total] = await Promise.all([
      PayoutAccount.find(filter)
        .populate({ path: "userId", select: "username displayName email" })
        .sort({ updatedAt: -1 })
        .skip((page - 1) * 20)
        .limit(20)
        .lean(),
      PayoutAccount.countDocuments(filter),
    ]);

    const rows = accounts.map((a: any) => ({
      _id: String(a._id),
      user: {
        _id: String(a.userId?._id ?? ""),
        username: a.userId?.username ?? "unknown",
        displayName: a.userId?.displayName ?? "",
        email: a.userId?.email ?? "",
      },
      method: a.method,
      bankName: a.bankName ?? null,
      accountName: a.accountName ?? null,
      accountNumberMasked: a.accountNumberEnc ? maskAccountNumber(decryptSecret(a.accountNumberEnc)) : null,
      cryptoNetwork: a.cryptoNetwork ?? null,
      walletAddressMasked: a.walletAddressEnc ? maskWalletAddress(decryptSecret(a.walletAddressEnc)) : null,
      verified: a.verified,
      updatedAt: a.updatedAt,
    }));

    return ok({ accounts: rows, total, page, hasMore: page * 20 < total });
  } catch (error) {
    return fail(error);
  }
});