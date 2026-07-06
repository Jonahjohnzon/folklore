// lib/reviews/badge-gate.ts
import { UserBadge } from "@/app/api/lib/models/UserBadge";
import "@/app/api/lib/models/Badge"; // ensures Badge is registered before populate

const ELITE_TIER = 5;

export async function hasEliteBadge(userId: string): Promise<boolean> {
  const earned = await UserBadge.find({ userId }).populate("badgeId", "tier").lean();
  return earned.some((ub) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const badge = ub.badgeId as any;
    return badge && badge.tier >= ELITE_TIER;
  });
}