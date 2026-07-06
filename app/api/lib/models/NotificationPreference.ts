// models/NotificationPreference.ts
import { Schema, model, models, Types, Model } from "mongoose";

export interface INotificationPreference {
  _id: Types.ObjectId;
  userId: Types.ObjectId;

  emailCommentReply: boolean;
  emailNewComment: boolean;
  emailChapterPublished: boolean;
  emailReadingReminder: boolean;
  emailNewReview: boolean;
  emailMarketing: boolean;

  unsubscribeToken: string;
}

const NotificationPreferenceSchema = new Schema<INotificationPreference>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  emailCommentReply: { type: Boolean, default: true },
  emailNewComment: { type: Boolean, default: true },
  emailChapterPublished: { type: Boolean, default: true },
  emailReadingReminder: { type: Boolean, default: true },
  emailNewReview: { type: Boolean, default: true },
  emailMarketing: { type: Boolean, default: false },
  unsubscribeToken: { type: String, required: true, unique: true },
});

export const NotificationPreference =
  (models.NotificationPreference as Model<INotificationPreference>) ??
  model<INotificationPreference>("NotificationPreference", NotificationPreferenceSchema);