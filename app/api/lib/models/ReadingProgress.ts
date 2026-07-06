import { Schema, model, models, Types, Model } from "mongoose";

export interface IReadingProgress {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  bookId: Types.ObjectId;
  chapterId: Types.ObjectId;

  // Denormalized snapshot, refreshed on every write — same trade-off as the
  // Book/Chapter counters elsewhere in this app: history stays fast to read
  // without an n+1 populate, at the cost of possibly showing a slightly
  // stale title if it's edited after the read.
  chapterOrderIndex: number;
  chapterTitle: string;
  bookTitle: string;
  bookSlug: string;
  bookCoverUrl: string | null;

  progressPct: number; // 0–100, scroll position within the chapter
  completed: boolean;
  lastReadAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReadingProgressSchema = new Schema<IReadingProgress>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    bookId: { type: Schema.Types.ObjectId, ref: "Book", required: true, index: true },
    chapterId: { type: Schema.Types.ObjectId, ref: "Chapter", required: true, index: true },

    chapterOrderIndex: { type: Number, required: true },
    chapterTitle: { type: String, required: true },
    bookTitle: { type: String, required: true },
    bookSlug: { type: String, required: true },
    bookCoverUrl: { type: String, default: null },

    progressPct: { type: Number, default: 0, min: 0, max: 100 },
    completed: { type: Boolean, default: false },
    lastReadAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Reopening a chapter updates its row in place — this is a "furthest state
// per chapter" table, not an append-only visit log.
ReadingProgressSchema.index({ userId: 1, chapterId: 1 }, { unique: true });
// History feed: most recent activity first.
ReadingProgressSchema.index({ userId: 1, lastReadAt: -1 });

export const ReadingProgress =
  (models.ReadingProgress as Model<IReadingProgress>) ?? model<IReadingProgress>("ReadingProgress", ReadingProgressSchema);