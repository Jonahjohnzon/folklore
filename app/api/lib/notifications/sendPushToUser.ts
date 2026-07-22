// app/api/lib/notifications/sendPushToUser.ts
import { Expo, ExpoPushMessage, ExpoPushTicket } from "expo-server-sdk";
import { DeviceToken } from "@/app/api/lib/models/DeviceToken";

const expo = new Expo();

interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, unknown>; // e.g. { link: "/book/some-slug" }
}

export async function sendPushToUser(userId: string, payload: PushPayload) {
    
  const devices = await DeviceToken.find({ userId }).select("token").lean();
   
  if (devices.length === 0) return;

  const messages: ExpoPushMessage[] = [];

  for (const device of devices) {
    if (!Expo.isExpoPushToken(device.token)) {
      console.warn(`[push] invalid token, skipping: ${device.token}`);
      continue;
    }
    messages.push({
      to: device.token,
      sound: "default",
      title: payload.title,
      body: payload.body,
      data: payload.data ?? {},
    });
  }

  if (messages.length === 0) return;

  // Expo recommends batching in chunks of 100
  const chunks = expo.chunkPushNotifications(messages);
  const tickets: ExpoPushTicket[] = [];

  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    } catch (err) {
      console.error("[push] error sending chunk:", err);
    }
  }

  // Handle tokens that are dead (e.g. app uninstalled) — clean them up
  for (let i = 0; i < tickets.length; i++) {
    const ticket = tickets[i];
    if (ticket.status === "error" && ticket.details?.error === "DeviceNotRegistered") {
      await DeviceToken.deleteOne({ token: messages[i].to });
    }
  }

  return tickets;
}

// app/api/lib/notifications/sendPushToUser.ts — add this alongside sendPushToUser
export async function sendPushToUsers(userIds: string[], payload: PushPayload) {
  if (userIds.length === 0) return;

  const devices = await DeviceToken.find({ userId: { $in: userIds } }).select("token").lean();
  if (devices.length === 0) return;

  const messages: ExpoPushMessage[] = [];
  for (const device of devices) {
    if (!Expo.isExpoPushToken(device.token)) continue;
    messages.push({
      to: device.token,
      sound: "default",
      title: payload.title,
      body: payload.body,
      data: payload.data ?? {},
    });
  }
  if (messages.length === 0) return;

  const chunks = expo.chunkPushNotifications(messages);
  for (const chunk of chunks) {
    try {
      await expo.sendPushNotificationsAsync(chunk);
    } catch (err) {
      console.error("[push] bulk chunk failed:", err);
    }
  }
}