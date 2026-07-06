import { Schema, model, models, Types, Model } from "mongoose";
import type { SignalType } from "../types";

// ── AlgoSignal ────────────────────────────────────────────────
export interface IAlgoSignal {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  signal: SignalType;
  bookId?: Types.ObjectId;
  chapterId?: Types.ObjectId;
  tagId?: Types.ObjectId;
  payload: Record<string, unknown>;
  // payload examples:
  //   time_on_page: { seconds: 420 }
  //   search_query: { query: "dark romance" }
  weight: number;
  createdAt: Date;
}

const AlgoSignalSchema = new Schema<IAlgoSignal>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    signal: {
      type: String,
      enum: [
        "read_chapter",
        "completed_book",
        "abandoned_book",
        "purchased_chapter",
        "reviewed",
        "shared",
        "time_on_page",
        "skipped_chapter",
        "search_query",
        "tag_clicked",
      ] satisfies SignalType[],
      required: true,
    },
    bookId: { type: Schema.Types.ObjectId, ref: "Book" },
    chapterId: { type: Schema.Types.ObjectId, ref: "Chapter" },
    tagId: { type: Schema.Types.ObjectId, ref: "Tag" },
    payload: { type: Schema.Types.Mixed, default: {} },
    weight: { type: Number, default: 1.0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

AlgoSignalSchema.index({ userId: 1, createdAt: -1 });
AlgoSignalSchema.index({ bookId: 1 }, { sparse: true });
AlgoSignalSchema.index({ signal: 1 });

export const AlgoSignal =
  models.AlgoSignal ?? model<IAlgoSignal>("AlgoSignal", AlgoSignalSchema);

// ── Recommendation ────────────────────────────────────────────
export interface IRecommendation {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  bookId: Types.ObjectId;
  score: number;
  reasonCode: string; // 'tag_match' | 'similar_readers' | 'author_follow' | 'trending'
  rank: number; // 1 = highest priority for this user
  generatedAt: Date;
  expiresAt: Date;
}

const RecommendationSchema = new Schema<IRecommendation>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    bookId: { type: Schema.Types.ObjectId, ref: "Book", required: true },
    score: { type: Number, required: true },
    reasonCode: { type: String, required: true },
    rank: { type: Number, required: true },
    generatedAt: { type: Date, default: Date.now },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // +24h
    },
  },
  { timestamps: false }
);

// Auto-purge expired recommendations via TTL index
RecommendationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
RecommendationSchema.index({ userId: 1, bookId: 1 }, { unique: true });
RecommendationSchema.index({ userId: 1, rank: 1 });
RecommendationSchema.index({ score: -1 });

export const Recommendation =
  (models.Recommendation as Model<IRecommendation>) ??
  model<IRecommendation>("Recommendation", RecommendationSchema);