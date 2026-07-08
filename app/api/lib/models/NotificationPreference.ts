import { Schema, model, models, Types, Model } from "mongoose";
import crypto from "crypto";

export interface INotificationPreference {
  _id: Types.ObjectId;
  userId: Types.ObjectId;

  // Each toggle controls BOTH the in-app notification and the email for that
  // category — one switch, two channels, simpler mental model for the user.
  notifyNewChapter: boolean; // new_chapter, chapter_published, book_completed_series
  notifyComments: boolean; // comment_reply, new_comment, mention
  notifyReviews: boolean; // new_review
  notifyNewFollower: boolean; // new_follower (in-app only — no email type for this)

  // Email-only extras, not tied to a NotificationType at all
  emailDigest: boolean;
  emailProductUpdates: boolean;

  unsubscribeToken: string;

  createdAt: Date;
  updatedAt: Date;
}

const NotificationPreferenceSchema = new Schema<INotificationPreference>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },

    notifyNewChapter: { type: Boolean, default: true },
    notifyComments: { type: Boolean, default: true },
    notifyReviews: { type: Boolean, default: true },
    notifyNewFollower: { type: Boolean, default: true },

    emailDigest: { type: Boolean, default: false },
    emailProductUpdates: { type: Boolean, default: false },

    unsubscribeToken: {
      type: String,
      required: true,
      unique: true,
      default: () => crypto.randomBytes(24).toString("hex"),
    },
  },
  { timestamps: true }
);

export const NotificationPreference =
  (models.NotificationPreference as Model<INotificationPreference>) ??
  model<INotificationPreference>("NotificationPreference", NotificationPreferenceSchema);