// app/api/notifications/route.ts
import { withAuth } from "@/app/api/auth/withAuth";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { Notification } from "@/app/api/lib/models/Notification";
import { ok, fail } from "@/app/api/response";
import { optionalAuth } from "../auth/optionalAuth";

export const GET = optionalAuth(async (req) => {
  try {
    await connectToDatabase();
    if (!req.user) {
      return ok({ notifications: [], unreadCount: 0, nextCursor: null });
    }
    const url = new URL(req.url);
    const cursor = url.searchParams.get("cursor");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = { userId: req.user.sub };
    if (cursor) filter.createdAt = { $lt: new Date(cursor) };

    const [notifications, unreadCount] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).limit(30).lean(),
      Notification.countDocuments({ userId: req.user.sub, read: false }),
    ]);

    return ok({
      notifications: notifications.map((n) => ({
        id: String(n._id),
        type: n.type,
        message: n.message,
        link: n.link,
        read: n.read,
        createdAt: n.createdAt,
      })),
      unreadCount,
      nextCursor: notifications.length === 30 ? notifications[notifications.length - 1].createdAt : null,
    });
  } catch (error) {
    return fail(error);
  }
});

export const PATCH = withAuth(async (req) => {
  try {
    await connectToDatabase();
    const { notificationId, markAll } = await req.json();

    if (markAll) {
      await Notification.updateMany({ userId: req.user.sub, read: false }, { read: true });
    } else if (notificationId) {
      await Notification.updateOne({ _id: notificationId, userId: req.user.sub }, { read: true });
    }

    return ok({ updated: true });
  } catch (error) {
    return fail(error);
  }
});

export const DELETE = withAuth(async (req) => {
  try {
    await connectToDatabase();
    const url = new URL(req.url);
    const notificationId = url.searchParams.get("notificationId");
    const clearAll = url.searchParams.get("clearAll") === "true";

    if (clearAll) {
      await Notification.deleteMany({ userId: req.user.sub });
    } else if (notificationId) {
      await Notification.deleteOne({ _id: notificationId, userId: req.user.sub });
    } else {
      return fail(new Error("notificationId or clearAll is required"));
    }

    return ok({ deleted: true });
  } catch (error) {
    return fail(error);
  }
});