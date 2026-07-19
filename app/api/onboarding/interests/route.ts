// app/api/onboarding/interests/route.ts
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { Tag } from "@/app/api/lib/models/Tag";
import { User } from "@/app/api/lib/models/User";
import { ok, fail } from "@/app/api/response";
import { withAuth } from "../../auth/withAuth";
import { optionalAuth } from "../../auth/optionalAuth";

const MIN_INTERESTS = 3;
const MAX_INTERESTS = 10;

// GET: options to show on the picker screen — most-used genre/mood tags
export const GET = optionalAuth(async () => {
  try {
    await connectToDatabase();
    const tags = await Tag.find({ category: { $in: ["genre", "mood"] } })
      .select("name slug category usageCount")
      .sort({ usageCount: -1 })
      .limit(24)
      .lean();

    return ok({ tags: tags.map((t) => ({ id: String(t._id), name: t.name, slug: t.slug, category: t.category })) });
  } catch (error) {
    return fail(error);
  }
});

// POST: save the user's picks and mark onboarding done
export const POST = withAuth(async (req) => {
  try {
    const { tagIds } = await req.json();

    if (!Array.isArray(tagIds) || tagIds.length < MIN_INTERESTS) {
      return fail({ message: `Pick at least ${MIN_INTERESTS} interests`, status: 400 });
    }
    if (tagIds.length > MAX_INTERESTS) {
      return fail({ message: `Pick at most ${MAX_INTERESTS} interests`, status: 400 });
    }

    await connectToDatabase();
    await User.findByIdAndUpdate(req.user.sub, {
      interestTags: tagIds,
      onboardingCompletedAt: new Date(),
    });

    return ok({ saved: true });
  } catch (error) {
    return fail(error);
  }
});