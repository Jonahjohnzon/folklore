// app/api/pages/chat/start/route.ts
import { withAuth } from "@/app/api/auth/withAuth";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { User } from "@/app/api/lib/models/User";
import { Conversation } from "@/app/api/lib/models/Conversation";
import { startConversationSchema } from "@/app/api/validation/chat.schema";
import { ok, fail } from "@/app/api/response";
import { NotFoundError, ValidationError, ForbiddenError } from "@/app/api/lib/db/errors";

const makeKey = (a: string, b: string) => [a, b].sort().join("_");

export const POST = withAuth(async (req) => {
  try {
    await connectToDatabase();

    const body = await req.json();
    const parsed = startConversationSchema.safeParse(body);
    if (!parsed.success) throw new ValidationError("Invalid input", parsed.error.flatten().fieldErrors);

    const otherUser = await User.findOne({ username: parsed.data.username })
      .select("_id blockedUsers")
      .lean();
    if (!otherUser) throw new NotFoundError("User not found");

    const myId = req.user.sub;
    if (String(otherUser._id) === myId) throw new ValidationError("You can't message yourself");

    const me = await User.findById(myId).select("blockedUsers").lean();
    const iBlockedThem = me?.blockedUsers?.some((id) => String(id) === String(otherUser._id));
    const theyBlockedMe = (otherUser.blockedUsers as unknown[] | undefined)?.some((id) => String(id) === myId);
    if (iBlockedThem || theyBlockedMe) throw new ForbiddenError("You can't message this user");

    const participantsKey = makeKey(myId, String(otherUser._id));

    let conversation = await Conversation.findOne({ participantsKey });
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [myId, otherUser._id],
        participantsKey,
        lastMessageAt: new Date(),
        unreadCounts: {},
      });
    }

    return ok({ conversationId: String(conversation._id) });
  } catch (error) {
    return fail(error);
  }
});