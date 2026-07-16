// app/api/lib/models/Conversation.ts
import { Schema, model, models, Model, Types } from "mongoose";

export interface IConversation {
  _id: Types.ObjectId;
  participants: Types.ObjectId[];
  participantsKey: string;
  lastMessage: { body: string; senderId: Types.ObjectId; createdAt: Date; deleted?: boolean } | null;
  lastMessageAt: Date;
  unreadCounts: Map<string, number>;
  clearedAt: Map<string, Date>; // per-user "clear chat" cutoff — messages before this are hidden for that user
  hiddenFor: Types.ObjectId[]; // users who've removed this conversation from their list ("clear all chats")
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    participantsKey: { type: String, required: true, unique: true },
    lastMessage: {
      body: { type: String },
      senderId: { type: Schema.Types.ObjectId, ref: "User" },
      createdAt: { type: Date },
      deleted: { type: Boolean },
    },
    lastMessageAt: { type: Date, default: Date.now },
    unreadCounts: { type: Map, of: Number, default: {} },
    clearedAt: { type: Map, of: Date, default: {} },
    hiddenFor: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

ConversationSchema.index({ participants: 1, lastMessageAt: -1 });

export const Conversation =
  (models.Conversation as Model<IConversation>) ?? model<IConversation>("Conversation", ConversationSchema);