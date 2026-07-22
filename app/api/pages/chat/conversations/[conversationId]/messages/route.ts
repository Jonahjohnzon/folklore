// app/api/pages/chat/conversations/[conversationId]/messages/route.ts — GET updated, POST updated
import { withAuth } from "@/app/api/auth/withAuth";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { Conversation } from "@/app/api/lib/models/Conversation";
import { Message } from "@/app/api/lib/models/Message";
import { sendMessageSchema } from "@/app/api/validation/chat.schema";
import { ok, fail } from "@/app/api/response";
import { NotFoundError, ForbiddenError, ValidationError } from "@/app/api/lib/db/errors";
import { waitUntil } from "@vercel/functions";
import { sendPushToUser } from "@/app/api/lib/notifications/sendPushToUser";

const PAGE_SIZE = 30;

export const GET = withAuth(async (req, ctx) => {
  try {
    await connectToDatabase();
    const { conversationId } = await ctx.params;
    const myId = req.user.sub;

    const conversation = await Conversation.findById(conversationId).lean();
    if (!conversation) throw new NotFoundError("Conversation not found");
    if (!conversation.participants.some((p) => String(p) === myId)) throw new ForbiddenError("Not your conversation");

    const url = new URL(req.url);
    const before = url.searchParams.get("before");

    const query: Record<string, unknown> = { conversationId };
    const clearedAt = (conversation.clearedAt as unknown as Record<string, string> | undefined)?.[myId];
    if (clearedAt) query.createdAt = { ...(query.createdAt as object), $gt: new Date(clearedAt) };
    if (before) query.createdAt = { ...(query.createdAt as object), $lt: new Date(before) };

    const messages = await Message.find(query).sort({ createdAt: -1 }).limit(PAGE_SIZE).lean();

    return ok({
      messages: messages.reverse().map((m) => ({
        _id: String(m._id),
        senderId: String(m.senderId),
        body: m.deleted ? "" : m.body,
        deleted: !!m.deleted,
        editedAt: m.editedAt ?? null,
        createdAt: m.createdAt,
        readBy: (m.readBy ?? []).map(String),
      })),
      hasMore: messages.length === PAGE_SIZE,
    });
  } catch (error) {
    return fail(error);
  }
});



export const POST = withAuth(async (req, ctx) => {
  try {
    await connectToDatabase();
    const { conversationId } = await ctx.params;
    const myId = req.user.sub;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) throw new NotFoundError("Conversation not found");
    if (!conversation.participants.some((p) => String(p) === myId)) throw new ForbiddenError("Not your conversation");

    const body = await req.json();
    const parsed = sendMessageSchema.safeParse(body);
    if (!parsed.success) throw new ValidationError("Invalid input", parsed.error.flatten().fieldErrors);

    const message = await Message.create({
      conversationId,
      senderId: myId,
      body: parsed.data.body,
      readBy: [myId],
    });

    const otherId = conversation.participants.find((p) => String(p) !== myId);
    const currentUnread = otherId ? conversation.unreadCounts?.get(String(otherId)) ?? 0 : 0;

    conversation.lastMessage = { body: parsed.data.body, senderId: message.senderId, createdAt: message.createdAt, deleted: false };
    conversation.lastMessageAt = message.createdAt;
    if (otherId) {
      conversation.unreadCounts.set(String(otherId), currentUnread + 1);
      conversation.hiddenFor = conversation.hiddenFor.filter((id) => String(id) !== String(otherId));
    }
    await conversation.save();

    if (otherId) {
      waitUntil(
        sendPushToUser(String(otherId), {
          title: "New message",
          body: parsed.data.body,
          data: { link: `/messages/${conversationId}` },
        }).catch((err) => console.error("[push] message notification failed:", err))
      );
    }

    return ok({
      message: {
        _id: String(message._id),
        senderId: String(message.senderId),
        body: message.body,
        deleted: false,
        editedAt: null,
        createdAt: message.createdAt,
        readBy: [myId],
      },
    });
  } catch (error) {
    return fail(error);
  }
});