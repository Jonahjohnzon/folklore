// app/api/lib/models/DailyStat.ts
import { Schema, model, models, Types, Model } from "mongoose";

export interface IDailyStat {
  _id: Types.ObjectId;
  bookId: Types.ObjectId;
  chapterId: Types.ObjectId;
  date: string; // "YYYY-MM-DD", UTC
  reads: number;
}

const DailyStatSchema = new Schema<IDailyStat>({
  bookId: { type: Schema.Types.ObjectId, ref: "Book", required: true, index: true },
  chapterId: { type: Schema.Types.ObjectId, ref: "Chapter", required: true },
  date: { type: String, required: true, index: true },
  reads: { type: Number, default: 0 },
});

// one doc per chapter per day — cheap to upsert-and-increment on every read
DailyStatSchema.index({ chapterId: 1, date: 1 }, { unique: true });
DailyStatSchema.index({ bookId: 1, date: 1 });

export const DailyStat =
  (models.DailyStat as Model<IDailyStat>) ?? model<IDailyStat>("DailyStat", DailyStatSchema);