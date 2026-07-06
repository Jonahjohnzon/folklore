import { Schema, model, models, Types, Model } from "mongoose";

export interface IChapterLike {
  _id: Types.ObjectId;
  chapterId: Types.ObjectId;
  userId: Types.ObjectId;
  createdAt: Date;
}

const ChapterLikeSchema = new Schema<IChapterLike>(
  {
    chapterId: { type: Schema.Types.ObjectId, ref: "Chapter", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// One like per user per chapter, enforced by the database.
ChapterLikeSchema.index({ chapterId: 1, userId: 1 }, { unique: true });

export const ChapterLike = (models.ChapterLike as Model<IChapterLike>) ?? model<IChapterLike>("ChapterLike", ChapterLikeSchema);