// app/api/pages/chat/conversations/route.ts — GET, updated
import { withAuth } from "@/app/api/auth/withAuth";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { Conversation } from "@/app/api/lib/models/Conversation";
import { ok, fail } from "@/app/api/response";

export const GET = withAuth(async (req) => {
  try {
    await connectToDatabase();
    const myId = req.user.sub;

    const conversations = await Conversation.find({
      participants: myId,
      hiddenFor: { $ne: myId },
    })
      .sort({ lastMessageAt: -1 })
      .populate("participants", "username displayName avatarUrl")
      .lean();

    const data = conversations.map((c) => {
      const other = (
        c.participants as unknown as { _id: unknown; username: string; displayName?: string; avatarUrl?: string }[]
      ).find((p) => String(p._id) !== myId);
      const unread = (c.unreadCounts as unknown as Record<string, number> | undefined)?.[myId] ?? 0;
      const clearedAt = (c.clearedAt as unknown as Record<string, string> | undefined)?.[myId];

      // don't show a preview from before this user's own "clear chat" cutoff
      const showLastMessage = c.lastMessage && (!clearedAt || new Date(c.lastMessage.createdAt) > new Date(clearedAt));

      return {
        _id: String(c._id),
        otherUser: other
          ? { username: other.username, displayName: other.displayName ?? other.username, avatarUrl: other.avatarUrl ?? null }
          : null,
        lastMessage:
          showLastMessage && c.lastMessage
            ? {
                body: c.lastMessage.deleted ? "This message was deleted" : c.lastMessage.body,
                senderId: String(c.lastMessage.senderId),
                createdAt: c.lastMessage.createdAt,
                deleted: !!c.lastMessage.deleted,
              }
            : null,
        lastMessageAt: c.lastMessageAt,
        unreadCount: unread,
      };
    });

    return ok({ conversations: data });
  } catch (error) {
    return fail(error);
  }
});