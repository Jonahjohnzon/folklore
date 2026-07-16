// app/api/pages/chat/conversations/[conversationId]/clear/route.ts
import { withAuth } from "@/app/api/auth/withAuth";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { Conversation } from "@/app/api/lib/models/Conversation";
import { ok, fail } from "@/app/api/response";
import { NotFoundError, ForbiddenError } from "@/app/api/lib/db/errors";

// "Clear chat" — hides all current messages in this conversation for the
// requesting user only. The other participant's view is untouched.
export const POST = withAuth(async (req, ctx) => {
  try {
    await connectToDatabase();
    const { conversationId } = await ctx.params;
    const myId = req.user.sub;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) throw new NotFoundError("Conversation not found");
    if (!conversation.participants.some((p) => String(p) === myId)) throw new ForbiddenError("Not your conversation");

    conversation.clearedAt.set(myId, new Date());
    await conversation.save();

    return ok({ cleared: true });
  } catch (error) {
    return fail(error);
  }
});