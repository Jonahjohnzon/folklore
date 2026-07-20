// app/api/notifications/device-token/route.ts
import { withAuth } from "@/app/api/auth/withAuth";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { DeviceToken } from "@/app/api/lib/models/DeviceToken";
import { ok, fail } from "@/app/api/response";

// A token can move between accounts (shared/reset device), so upsert on token
// and re-point it at whichever user just registered it.
export const POST = withAuth(async (req) => {
  try {
    await connectToDatabase();
    const { token, platform } = await req.json();

    if (!token || !platform) {
      return fail(new Error("token and platform are required"));
    }

    await DeviceToken.updateOne(
      { token },
      { $set: { userId: req.user.sub, platform, createdAt: new Date() } },
      { upsert: true }
    );

    return ok({ registered: true });
  } catch (error) {
    return fail(error);
  }
});

// Called on logout so a shared/reset device stops receiving this user's pushes.
export const DELETE = withAuth(async (req) => {
  try {
    await connectToDatabase();
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return fail(new Error("token is required"));
    }

    await DeviceToken.deleteOne({ token, userId: req.user.sub });

    return ok({ unregistered: true });
  } catch (error) {
    return fail(error);
  }
});