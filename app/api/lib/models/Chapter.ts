import { Schema, model, models, Types, Model } from "mongoose";
import type { ChapterAccess, SoundEffect } from "../types";

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
  audioIntroUrl?: string;
  soundEffects: SoundEffect[];

  // engagement counters (denormalized for fast reads; kept in sync via
  // $inc in the like/comment routes rather than counted on every request)
  likesCount: number;
  commentsCount: number;

  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Embedded sub-schema for sound effects
const SoundEffectSchema = new Schema<SoundEffect>(
  {
    trigger: { type: String, enum: ["scroll_pct", "paragraph_id"], required: true },
    value: { type: Number, required: true },
    url: { type: String, required: true },
    volume: { type: Number, default: 0.6, min: 0, max: 1 },
  },
  { _id: false }
);

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

    audioIntroUrl: { type: String },
    soundEffects: { type: [SoundEffectSchema], default: [] },

    likesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },

    publishedAt: { type: Date },
  },
  { timestamps: true }
);

// Compound unique: each book's chapter order must be unique
ChapterSchema.index({ bookId: 1, orderIndex: 1 }, { unique: true });

export const Chapter = (models.Chapter as Model<IChapter>) ?? model<IChapter>("Chapter", ChapterSchema);