import { Schema, model, models, Types, Model } from "mongoose";

export interface IChapterUnlock {
  _id: Types.ObjectId;
  chapterId: Types.ObjectId;
  userId: Types.ObjectId;
  bookId: Types.ObjectId;
  coinsSpent: number;
  createdAt: Date;
}

const ChapterUnlockSchema = new Schema<IChapterUnlock>(
  {
    chapterId: { type: Schema.Types.ObjectId, ref: "Chapter", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    bookId: { type: Schema.Types.ObjectId, ref: "Book", required: true },
    coinsSpent: { type: Number, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// one unlock per user per chapter — also lets us use E11000 as an "already unlocked" guard
ChapterUnlockSchema.index({ chapterId: 1, userId: 1 }, { unique: true });

export const ChapterUnlock =
  (models.ChapterUnlock as Model<IChapterUnlock>) ?? model<IChapterUnlock>("ChapterUnlock", ChapterUnlockSchema);