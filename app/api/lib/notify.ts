// app/api/lib/notify.ts
import { Notification } from "@/app/api/lib/models/Notification";
import { DeviceToken } from "@/app/api/lib/models/DeviceToken";
import { sendExpoPush } from "@/app/api/lib/push/sendExpoPush";

interface NotifyUserInput {
  userId: string;
  type: string;
  message: string;
  link: string;
}

// Use this everywhere a notification is currently created (comment, like,
// follow, chapter, system) instead of calling Notification.create directly.
// It writes the in-app row AND fires a push to every device the user is
// signed in on, so the phone gets an alert even if the app is closed.
export async function notifyUser({ userId, type, message, link }: NotifyUserInput) {
  const notification = await Notification.create({ userId, type, message, link, read: false });

  const devices = await DeviceToken.find({ userId }).lean();
  if (devices.length > 0) {
    const result = await sendExpoPush(
      devices.map((d) => d.token),
      { title: "Tipatale", body: message, data: { link } }
    );

    if (result?.staleTokens.length) {
      await DeviceToken.deleteMany({ token: { $in: result.staleTokens } });
    }
  }

  return notification;
}