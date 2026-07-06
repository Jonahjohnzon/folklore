// lib/badges/BadgeAwardService.ts
import { User } from "@/app/api/lib/models/User";
import { Badge } from "@/app/api/lib/models/Badge";
import { UserBadge } from "@/app/api/lib/models/UserBadge";
import { Types } from "mongoose";

function isSameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}
function isYesterday(a: Date, b: Date) {
  const d = new Date(b);
  d.setDate(d.getDate() - 1);
  return isSameDay(a, d);
}

export const BadgeAwardService = {
  // Call this once per chapter-read event, server-side only.
  async recordChapterRead(userId: string | Types.ObjectId) {
    const user = await User.findById(userId);
    if (!user) return;

    const now = new Date();
    const stats = user.readingStats ?? { chaptersReadCount: 0, currentStreak: 0, longestStreak: 0, lastReadDate: null };

    stats.chaptersReadCount += 1;

    if (!stats.lastReadDate) {
      stats.currentStreak = 1;
    } else if (isSameDay(stats.lastReadDate, now)) {
      // same-day repeat read — no streak change
    } else if (isYesterday(stats.lastReadDate, now)) {
      stats.currentStreak += 1;
    } else {
      stats.currentStreak = 1;
    }
    stats.longestStreak = Math.max(stats.longestStreak, stats.currentStreak);
    stats.lastReadDate = now;

    user.readingStats = stats;
    await user.save();

    await this.checkAndAward(user._id, stats.chaptersReadCount, stats.currentStreak);
  },

  async checkAndAward(userId: Types.ObjectId, chaptersRead: number, currentStreak: number) {
    const eligible = await Badge.find({
      active: true,
      $or: [
        { category: "reading_milestone", threshold: { $lte: chaptersRead } },
        { category: "streak", threshold: { $lte: currentStreak } },
      ],
    }).lean();

    if (!eligible.length) return;

    const already = await UserBadge.find({ userId, badgeId: { $in: eligible.map((b) => b._id) } })
      .distinct("badgeId");
    const alreadySet = new Set(already.map(String));

    const toAward = eligible.filter((b) => !alreadySet.has(String(b._id)));
    if (!toAward.length) return;

    await UserBadge.insertMany(
      toAward.map((b) => ({ userId, badgeId: b._id })),
      { ordered: false }
    ).catch(() => {}); // ignore dup-key races under concurrent reads

    return toAward; // useful if you want to surface a "badge earned" toast
  },
};