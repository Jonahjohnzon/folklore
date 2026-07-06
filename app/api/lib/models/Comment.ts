import { Schema, model, models, Types, Model } from "mongoose";

export interface IComment {
  _id: Types.ObjectId;
  chapterId: Types.ObjectId;
  bookId: Types.ObjectId;
  userId: Types.ObjectId;
  parentId?: Types.ObjectId | null; // null = top-level chapter comment, set = reply
  paragraphIndex?: number | null; // null = general chapter comment (not tied to a paragraph)
  content: string;
  likesCount: number;
  repliesCount: number;
  edited: boolean;
  deleted: boolean; // soft delete so reply threads/counters don't break
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    chapterId: { type: Schema.Types.ObjectId, ref: "Chapter", required: true, index: true },
    bookId: { type: Schema.Types.ObjectId, ref: "Book", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    parentId: { type: Schema.Types.ObjectId, ref: "Comment", default: null, index: true },
    paragraphIndex: { type: Number, default: null },
    content: { type: String, required: true, trim: true, maxlength: 2000 },
    likesCount: { type: Number, default: 0 },
    repliesCount: { type: Number, default: 0 },
    edited: { type: Boolean, default: false },
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Feed of top-level chapter comments, newest first.
CommentSchema.index({ chapterId: 1, parentId: 1, paragraphIndex: 1, createdAt: -1 });
// Replies under a given parent, oldest first — reads like a thread.
CommentSchema.index({ parentId: 1, createdAt: 1 });

export const Comment = (models.Comment as Model<IComment>) ?? model<IComment>("Comment", CommentSchema);