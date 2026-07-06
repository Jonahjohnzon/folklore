import { withAuth } from "@/app/api/auth/withAuth";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { NotificationPreference } from "@/app/api/lib/models/NotificationPreference";
import { ok, fail } from "@/app/api/response";
import { randomBytes } from "crypto";

export const GET = withAuth(async (req) => {
  try {
    await connectToDatabase();
    let pref = await NotificationPreference.findOne({ userId: req.user.sub }).lean();
    if (!pref) {
      pref = await NotificationPreference.create({
        userId: req.user.sub,
        unsubscribeToken: randomBytes(24).toString("hex"),
      });
    }
    return ok({ preferences: pref });
  } catch (error) {
    return fail(error);
  }
});

export const PATCH = withAuth(async (req) => {
  try {
    const updates = await req.json();
    await connectToDatabase();
    const allowed = ["emailCommentReply", "emailNewComment", "emailChapterPublished", "emailReadingReminder", "emailMarketing"];
    const safeUpdates = Object.fromEntries(Object.entries(updates).filter(([k]) => allowed.includes(k)));

    await NotificationPreference.updateOne({ userId: req.user.sub }, { $set: safeUpdates }, { upsert: true });
    return ok({ updated: true });
  } catch (error) {
    return fail(error);
  }
});
