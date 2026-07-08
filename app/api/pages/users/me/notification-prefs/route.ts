import { withAuth } from "@/app/api/auth/withAuth";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { NotificationPreference } from "@/app/api/lib/models/NotificationPreference";
import { ok, fail } from "@/app/api/response";

const EDITABLE_FIELDS = [
  "notifyNewChapter",
  "notifyComments",
  "notifyReviews",
  "notifyNewFollower",
  "emailDigest",
  "emailProductUpdates",
] as const;

type EditableField = (typeof EDITABLE_FIELDS)[number];

export const GET = withAuth(async (req) => {
  await connectToDatabase();
  const userId = req.user?.sub;
  if (!userId) return fail("Sign in required");

  let pref = await NotificationPreference.findOne({ userId }).lean();
  if (!pref) {
    const created = await NotificationPreference.create({ userId });
    pref = created.toObject();
  }

  return ok({ prefs: pref });
});

export const PATCH = withAuth(async (req) => {
  await connectToDatabase();
  const userId = req.user?.sub;
  if (!userId) return fail("Sign in required");

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return fail("Invalid request body");

  const update: Partial<Record<EditableField, boolean>> = {};
  for (const field of EDITABLE_FIELDS) {
    if (typeof body[field] === "boolean") {
      update[field] = body[field];
    }
  }

  if (Object.keys(update).length === 0) {
    return fail("No valid preference fields provided");
  }

  const pref = await NotificationPreference.findOneAndUpdate(
    { userId },
    { $set: update },
    { new: true, upsert: true }
  ).lean();

  return ok({ prefs: pref });
});