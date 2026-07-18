import { Schema, model, models, Types, Model } from "mongoose";
import type { BookStatus } from "../types";

const DEFAULT_COVER_URL =
  "https://res.cloudinary.com/luzebox/image/upload/v1784358538/default/default_1_2_pdnzhz.png";

export interface IBook {
  _id: Types.ObjectId;
  authorId: Types.ObjectId;
  title: string;
  slug: string;
  description?: string;
  coverUrl: string;
  language: string;
  status: BookStatus;
  matureContent: boolean;
  totalReads: number;
  totalChapters: number;
  averageRating: number;
  reviewCount: number;
  tags: Types.ObjectId[];
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  coverPublicId: string | null;
  deletedAt: Date | null;
  statusBeforeDelete: string | null;
}

const BookSchema = new Schema<IBook>(
  {
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    coverUrl: { type: String, default: DEFAULT_COVER_URL },
    coverPublicId: { type: String, default: null },
    language: { type: String, default: "en" },
    status: {
      type: String,
      enum: ["draft", "ongoing", "completed", "hiatus", "removed"] satisfies BookStatus[],
      default: "draft",
      index: true,
    },
    matureContent: { type: Boolean, default: false },
    totalReads: { type: Number, default: 0 },
    totalChapters: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
    publishedAt: { type: Date },
    deletedAt: { type: Date, default: null },
    statusBeforeDelete: { type: String, default: null },
  },
  { timestamps: true }
);

BookSchema.index({ title: "text", description: "text" });
BookSchema.index({ authorId: 1, status: 1 });
BookSchema.index({ tags: 1, status: 1, totalReads: -1 });
BookSchema.index({ tags: 1, status: 1, publishedAt: -1 });
BookSchema.index({ tags: 1, status: 1, averageRating: -1 });
BookSchema.index({ tags: 1, status: 1, updatedAt: -1 });

export const Book = (models.Book as Model<IBook>) ?? model<IBook>("Book", BookSchema);