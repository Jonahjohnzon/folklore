
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { User } from "@/app/api/lib/models/User";
import { Follow } from "@/app/api/lib/models/Follow";
import { UserBadge } from "@/app/api/lib/models/UserBadge";

import { ok, fail } from "@/app/api/response";
import { NotFoundError } from "@/app/api/lib/db/errors";
import { withAuth } from "@/app/api/auth/withAuth";
import  "@/app/api/lib/models/Badge";


export const GET = withAuth(async (req, ctx) => {
  try {
    await connectToDatabase();
    const { username } = await ctx.params;

    const target = await User.findOne({ username }).lean();
    if (!target) throw new NotFoundError("User not found");

    const requester = req.user;

    const [isFollowing, isBlocked, followerCount, earnedBadges] = await Promise.all([
      requester
        ? Follow.exists({ followerId: requester.sub, targetType: "author", authorId: target._id }).then((r) => r !== null)
        : Promise.resolve(false),
      requester
        ? User.exists({ _id: requester.sub, blockedUsers: target._id }).then((r) => r !== null)
        : Promise.resolve(false),
      Follow.countDocuments({ targetType: "author", authorId: target._id }),
      UserBadge.find({ userId: target._id })
        .populate("badgeId", "key category tier name threshold")
        .sort({ earnedAt: -1 })
        .lean(),
    ]);

    const badges = earnedBadges
      .filter((ub) => ub.badgeId) // drop rows whose Badge was deleted
      .map((ub) => {
        const b = ub.badgeId as any;
        return {
          key: b.key,
          category: b.category,
          tier: b.tier,
          name: b.name,
          description: b.category === "reading_milestone" ? `${b.threshold} chapters` : `${b.threshold}-day streak`,
          earnedAt: ub.earnedAt,
        };
      });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, email, following, blockedUsers, preferences, marketingOptIn, ...safe } =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      target as any;

    return ok({ user: { ...safe, isFollowing, isBlocked, followerCount, badges } });
  } catch (error) {
    return fail(error);
  }
});