import { Schema, model, models, Types, Model } from "mongoose";
import type { VoteType } from "../types";

// ── Review (book-level) ───────────────────────────────────────
export interface IReview {
  _id: Types.ObjectId;
  bookId: Types.ObjectId;
  userId: Types.ObjectId;
  rating: 1 | 2 | 3 | 4 | 5;
  body?: string;
  helpfulVotes: number;
  unhelpfulVotes: number;
  verifiedReader: boolean;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    bookId: { type: Schema.Types.ObjectId, ref: "Book", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    body: { type: String },
    helpfulVotes: { type: Number, default: 0 },
    unhelpfulVotes: { type: Number, default: 0 },
    verifiedReader: { type: Boolean, default: false },
    isPinned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ReviewSchema.index({ bookId: 1, userId: 1 }, { unique: true });
ReviewSchema.index({ bookId: 1, rating: -1 });
ReviewSchema.index({ userId: 1 });

export const Review = (models.Review as Model<IReview>) ?? model<IReview>("Review", ReviewSchema);

// ── ReviewVote ────────────────────────────────────────────────
export interface IReviewVote {
  _id: Types.ObjectId;
  reviewId: Types.ObjectId;
  userId: Types.ObjectId;
  vote: VoteType;
  createdAt: Date;
}

const ReviewVoteSchema = new Schema<IReviewVote>(
  {
    reviewId: { type: Schema.Types.ObjectId, ref: "Review", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    vote: { type: String, enum: ["helpful", "unhelpful"] satisfies VoteType[], required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

ReviewVoteSchema.index({ reviewId: 1, userId: 1 }, { unique: true });

export const ReviewVote =
  (models.ReviewVote as Model<IReviewVote>) ?? model<IReviewVote>("ReviewVote", ReviewVoteSchema);

// ── ChapterReview (chapter-level discussion) ──────────────────
export interface IChapterReview {
  _id: Types.ObjectId;
  chapterId: Types.ObjectId;
  userId: Types.ObjectId;
  body: string;
  votes: number;
  createdAt: Date;
  updatedAt: Date;
}

const ChapterReviewSchema = new Schema<IChapterReview>(
  {
    chapterId: { type: Schema.Types.ObjectId, ref: "Chapter", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    body: { type: String, required: true },
    votes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ChapterReviewSchema.index({ chapterId: 1, userId: 1 }, { unique: true });
ChapterReviewSchema.index({ chapterId: 1, votes: -1 });

export const ChapterReview =
  (models.ChapterReview as Model<IChapterReview>) ?? model<IChapterReview>("ChapterReview", ChapterReviewSchema);

// ── ChapterReviewVote ─────────────────────────────────────────
export interface IChapterReviewVote {
  _id: Types.ObjectId;
  chapterReviewId: Types.ObjectId;
  userId: Types.ObjectId;
  vote: VoteType;
  createdAt: Date;
}

const ChapterReviewVoteSchema = new Schema<IChapterReviewVote>(
  {
    chapterReviewId: { type: Schema.Types.ObjectId, ref: "ChapterReview", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    vote: { type: String, enum: ["helpful", "unhelpful"] satisfies VoteType[], required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

ChapterReviewVoteSchema.index({ chapterReviewId: 1, userId: 1 }, { unique: true });

export const ChapterReviewVote =
  (models.ChapterReviewVote as Model<IChapterReviewVote>) ??
  model<IChapterReviewVote>("ChapterReviewVote", ChapterReviewVoteSchema);