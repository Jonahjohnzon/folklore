// models/UserBadge.ts
import { Schema, model, models, Types, Model } from "mongoose";

export interface IUserBadge {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  badgeId: Types.ObjectId;
  earnedAt: Date;
}

const UserBadgeSchema = new Schema<IUserBadge>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    badgeId: { type: Schema.Types.ObjectId, ref: "Badge", required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

UserBadgeSchema.index({ userId: 1, badgeId: 1 }, { unique: true });

export const UserBadge = (models.UserBadge as Model<IUserBadge>) ?? model<IUserBadge>("UserBadge", UserBadgeSchema);