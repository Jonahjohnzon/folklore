// models/Follow.ts
import { Schema, model, models, Types, Model } from "mongoose";

export type FollowTargetType = "book" | "author";

export interface IFollow {
  _id: Types.ObjectId;
  followerId: Types.ObjectId;
  targetType: FollowTargetType;
  bookId?: Types.ObjectId;
  authorId?: Types.ObjectId;
  createdAt: Date;
}

const FollowSchema = new Schema<IFollow>(
  {
    followerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    targetType: { type: String, enum: ["book", "author"], required: true },
    bookId: { type: Schema.Types.ObjectId, ref: "Book" },
    authorId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

FollowSchema.index(
  { followerId: 1, bookId: 1 },
  { unique: true, partialFilterExpression: { targetType: "book" } }
);
FollowSchema.index(
  { followerId: 1, authorId: 1 },
  { unique: true, partialFilterExpression: { targetType: "author" } }
);
FollowSchema.index({ bookId: 1 }, { partialFilterExpression: { targetType: "book" } });
FollowSchema.index({ authorId: 1 }, { partialFilterExpression: { targetType: "author" } });

export const Follow = (models.Follow as Model<IFollow>) ?? model<IFollow>("Follow", FollowSchema);