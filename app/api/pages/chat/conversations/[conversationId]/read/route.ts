// app/api/pages/chat/conversations/[conversationId]/read/route.ts
import { withAuth } from "@/app/api/auth/withAuth";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { Conversation } from "@/app/api/lib/models/Conversation";
import { Message } from "@/app/api/lib/models/Message";
import { ok, fail } from "@/app/api/response";
import { NotFoundError, ForbiddenError } from "@/app/api/lib/db/errors";

export const POST = withAuth(async (req, ctx) => {
  try {
    await connectToDatabase();
    const { conversationId } = await ctx.params;
    const myId = req.user.sub;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) throw new NotFoundError("Conversation not found");
    if (!conversation.participants.some((p) => String(p) === myId)) throw new ForbiddenError("Not your conversation");

    conversation.unreadCounts.set(myId, 0);
    await conversation.save();

    await Message.updateMany({ conversationId, readBy: { $ne: myId } }, { $addToSet: { readBy: myId } });

    return ok({ read: true });
  } catch (error) {
    return fail(error);
  }
});