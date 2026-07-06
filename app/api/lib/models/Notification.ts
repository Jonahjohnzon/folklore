// models/Notification.ts
import { Schema, model, models, Types, Model } from "mongoose";
import type { NotificationType } from "../types";

export interface INotification {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  type: NotificationType;
  actorId?: Types.ObjectId;
  bookId?: Types.ObjectId;
  chapterId?: Types.ObjectId;
  commentId?: Types.ObjectId;
  reviewId?: Types.ObjectId;
  message: string;
  link: string;
  read: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: {
      type: String,
      enum: [
        "comment_reply",
        "new_comment",
        "chapter_published",
        "reading_reminder",
        "book_completed_series",
        "mention",
        "new_chapter",
        "new_review",
        "review_vote",
        "new_follower",
        "payout_initiated",
        "payout_completed",
        "earnings_update",
        "subscription_expiring",
      ] satisfies NotificationType[],
      required: true,
    },
    actorId: { type: Schema.Types.ObjectId, ref: "User" },
    bookId: { type: Schema.Types.ObjectId, ref: "Book" },
    chapterId: { type: Schema.Types.ObjectId, ref: "Chapter" },
    commentId: { type: Schema.Types.ObjectId, ref: "Comment" },
    reviewId: { type: Schema.Types.ObjectId, ref: "Review" },
    message: { type: String, required: true },
    link: { type: String, required: true },
    read: { type: Boolean, default: false, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

export const Notification =
  (models.Notification as Model<INotification>) ?? model<INotification>("Notification", NotificationSchema);