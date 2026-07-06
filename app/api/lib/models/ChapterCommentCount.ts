// models/ChapterCommentCount.ts
// Optional denormalized counts per paragraph, updated on comment create/delete,
// so the reader page can fetch counts in one query instead of aggregating live.
import { Schema, model, models, Types, Model } from "mongoose";

export interface IChapterCommentCount {
  chapterId: Types.ObjectId;
  counts: Map<string, number>; // key: paragraphIndex as string, value: comment count
}

const ChapterCommentCountSchema = new Schema<IChapterCommentCount>({
  chapterId: { type: Schema.Types.ObjectId, ref: "Chapter", required: true, unique: true },
  counts: { type: Map, of: Number, default: {} },
});

export const ChapterCommentCount =
  (models.ChapterCommentCount as Model<IChapterCommentCount>) ?? model<IChapterCommentCount>("ChapterCommentCount", ChapterCommentCountSchema);