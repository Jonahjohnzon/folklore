// app/api/pages/chat/conversations/clear-all/route.ts
import { withAuth } from "@/app/api/auth/withAuth";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { Conversation } from "@/app/api/lib/models/Conversation";
import { ok, fail } from "@/app/api/response";

// "Clear all chats" — removes every conversation from this user's inbox
// (hiddenFor) and clears each one's history for them. A new incoming
// message un-hides the conversation naturally via the GET filter below.
export const POST = withAuth(async (req) => {
  try {
    await connectToDatabase();
    const myId = req.user.sub;

    const conversations = await Conversation.find({ participants: myId });
    const now = new Date();

    await Promise.all(
      conversations.map((c) => {
        c.clearedAt.set(myId, now);
        if (!c.hiddenFor.some((id) => String(id) === myId)) {
          c.hiddenFor.push(myId as unknown as (typeof c.hiddenFor)[number]);
        }
        c.unreadCounts.set(myId, 0);
        return c.save();
      })
    );

    return ok({ cleared: conversations.length });
  } catch (error) {
    return fail(error);
  }
});