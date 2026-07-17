// app/api/pages/chat/unread-count/route.ts
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
      .select("unreadCounts")
      .lean();

    const total = conversations.reduce((sum, c) => {
      const count = (c.unreadCounts as unknown as Record<string, number> | undefined)?.[myId] ?? 0;
      return sum + count;
    }, 0);

    return ok({ unreadCount: total });
  } catch (error) {
    return fail(error);
  }
});