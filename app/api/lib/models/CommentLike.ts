import { Schema, model, models, Types,Model  } from "mongoose";

export interface ICommentLike {
  _id: Types.ObjectId;
  commentId: Types.ObjectId;
  userId: Types.ObjectId;
  createdAt: Date;
}

const CommentLikeSchema = new Schema<ICommentLike>(
  {
    commentId: { type: Schema.Types.ObjectId, ref: "Comment", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// One like per user per comment, enforced by the database — this holds
// even under concurrent double-clicks, unlike an application-level check.
CommentLikeSchema.index({ commentId: 1, userId: 1 }, { unique: true });

export const CommentLike = (models.CommentLike as Model<ICommentLike>) ?? model<ICommentLike>("CommentLike", CommentLikeSchema);