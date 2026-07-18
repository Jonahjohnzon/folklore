// app/api/lib/models/Message.ts
import { Schema, model, models, Model, Types } from "mongoose";

export interface IMessage {
  _id: Types.ObjectId;
  conversationId: Types.ObjectId;
  senderId: Types.ObjectId;
  body: string;
  readBy: Types.ObjectId[];
  deleted: boolean;
  editedAt: Date | null;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    body: { type: String, required: true, maxlength: 2000 },
    readBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    deleted: { type: Boolean, default: false },
    editedAt: { type: Date, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

MessageSchema.index({ conversationId: 1, createdAt: -1 });
MessageSchema.set("toJSON", {
  transform: (_doc, ret) => {
    if (ret.deleted) {
      ret.body = ""; // or "[deleted]"
    }
    return ret;
  },
});
export const Message =
  (models.Message as Model<IMessage>) ?? model<IMessage>("Message", MessageSchema);