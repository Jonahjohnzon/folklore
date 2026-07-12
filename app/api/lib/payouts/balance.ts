// app/api/lib/payouts/balance.ts
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { User } from "@/app/api/lib/models/User";
import { PayoutRequest } from "@/app/api/lib/models/PayoutRequest";

export const MIN_PAYOUT_COINS = 5000; // adjust to your actual minimum

/**
 * Reads the same coinBalance field CoinService.getBalance() exposes to the
 * reader-facing wallet. Assumes earnings from chapter unlocks are credited
 * directly onto this field (i.e. one shared coin balance per user, used for
 * both spending and earning) rather than a separate earnings ledger.
 */
async function getRawCoinBalance(userId: string): Promise<number> {
  await connectToDatabase();
  const user = await User.findById(userId).select("coinBalance").lean<{ coinBalance?: number }>();
  return user?.coinBalance ?? 0;
}

export async function getAvailableBalance(userId: string): Promise<{
  totalEarned: number;
  pendingOrApproved: number;
  available: number;
}> {
  const [rawBalance, tiedUp] = await Promise.all([
    getRawCoinBalance(userId),
    PayoutRequest.aggregate([
      { $match: { userId, status: { $in: ["pending", "approved"] } } },
      { $group: { _id: null, sum: { $sum: "$amountCoins" } } },
    ]).then((r) => r[0]?.sum ?? 0),
  ]);

  return {
    totalEarned: rawBalance,
    pendingOrApproved: tiedUp,
    available: Math.max(0, rawBalance - tiedUp),
  };
}