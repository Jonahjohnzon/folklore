import { Schema, model, models, Types, Model } from "mongoose";
import type { ChapterAccess } from "../types";

export interface IChapter {
  _id: Types.ObjectId;
  bookId: Types.ObjectId;

  orderIndex: number;
  title: string;
  content?: string; // HTML / markdown body
  wordCount: number;
  coverUrl?: string;

  accessType: ChapterAccess;
  coinsRequired: number; // only relevant when accessType = 'coins'

  // sound experience
  audioId?: string;
  

  // engagement counters (denormalized for fast reads; kept in sync via
  // $inc in the like/comment routes rather than counted on every request)
  likesCount: number;
  commentsCount: number;

  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Embedded sub-schema for sound effects


const ChapterSchema = new Schema<IChapter>(
  {
    bookId: {
      type: Schema.Types.ObjectId,
      ref: "Book",
      required: true,
      index: true,
    },

    orderIndex: { type: Number, required: true },
    title: { type: String, required: true },
    content: { type: String },
    wordCount: { type: Number, default: 0 },
    coverUrl: { type: String },

    accessType: {
      type: String,
      enum: ["free", "coins", "purchase", "subscriber_only"] satisfies ChapterAccess[],
      default: "free",
    },
    coinsRequired: { type: Number, default: 0 },

    audioId: { type: String },

    likesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },

    publishedAt: { type: Date },
  },
  { timestamps: true }
);

// Compound unique: each book's chapter order must be unique
ChapterSchema.index({ bookId: 1, orderIndex: 1 }, { unique: true });

export const Chapter = (models.Chapter as Model<IChapter>) ?? model<IChapter>("Chapter", ChapterSchema);