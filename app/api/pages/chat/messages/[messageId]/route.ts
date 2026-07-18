// app/api/pages/chat/messages/[messageId]/route.ts
import { withAuth } from "@/app/api/auth/withAuth";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { Message } from "@/app/api/lib/models/Message";
import { Conversation } from "@/app/api/lib/models/Conversation";
import { editMessageSchema } from "@/app/api/validation/chat.schema";
import { ok, fail } from "@/app/api/response";
import { NotFoundError, ForbiddenError, ValidationError } from "@/app/api/lib/db/errors";

export const PATCH = withAuth(async (req, ctx) => {
  try {
    await connectToDatabase();
    const { messageId } = await ctx.params;
    const myId = req.user.sub;

    const message = await Message.findById(messageId);
    if (!message) throw new NotFoundError("Message not found");
    if (String(message.senderId) !== myId) throw new ForbiddenError("You can only edit your own messages");
    if (message.deleted) throw new ForbiddenError("Can't edit a deleted message");

    const body = await req.json();
    const parsed = editMessageSchema.safeParse(body);
    if (!parsed.success) throw new ValidationError("Invalid input", parsed.error.flatten().fieldErrors);

    message.body = parsed.data.body;
    message.editedAt = new Date();
    await message.save();

    // keep the conversation preview in sync if this was the last message
    const conversation = await Conversation.findById(message.conversationId);
    if (conversation?.lastMessage && String(conversation.lastMessage.senderId) === myId) {
      const isLatest =
        (await Message.countDocuments({
          conversationId: message.conversationId,
          createdAt: { $gt: message.createdAt },
        })) === 0;
      if (isLatest) {
        conversation.lastMessage.body = message.body;
        await conversation.save();
      }
    }

    return ok({
      message: {
        _id: String(message._id),
        senderId: String(message.senderId),
        body: message.body,
        createdAt: message.createdAt,
        editedAt: message.editedAt,
        deleted: message.deleted,
        readBy: message.readBy.map(String),
      },
    });
  } catch (error) {
    return fail(error);
  }
});

export const DELETE = withAuth(async (req, ctx) => {
  try {
    await connectToDatabase();
    const { messageId } = await ctx.params;
    const myId = req.user.sub;

    const message = await Message.findById(messageId);
    
    if (!message) throw new NotFoundError("Message not found");
    if (String(message.senderId) !== myId) throw new ForbiddenError("You can only delete your own messages");

    message.deleted = true;
    await message.save();
  
    const conversation = await Conversation.findById(message.conversationId);
    if (conversation?.lastMessage && String(conversation.lastMessage.senderId) === myId) {
      const isLatest =
        (await Message.countDocuments({
          conversationId: message.conversationId,
          createdAt: { $gt: message.createdAt },
        })) === 0;
      if (isLatest) {
        conversation.lastMessage.deleted = true;
        await conversation.save();
      }
    }

    return ok({ deleted: true });
  } catch (error) {
    return fail(error);
  }
});