import { Schema, model, models, Types, Model } from "mongoose";

export interface IParagraphComment {
  _id: Types.ObjectId;
  chapterId: Types.ObjectId;
  bookId: Types.ObjectId;
  paragraphIndex: number;

  userId: Types.ObjectId;
  body: string;
  helpfulVotes: number;
  lovedBy: Types.ObjectId[]; // who has loved this comment — enforces one vote per user, no self-vote
  parentId?: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

const ParagraphCommentSchema = new Schema<IParagraphComment>(
  {
    chapterId: { type: Schema.Types.ObjectId, ref: "Chapter", required: true, index: true },
    bookId: { type: Schema.Types.ObjectId, ref: "Book", required: true, index: true },
    paragraphIndex: { type: Number, required: true },

    // No more denormalized username/avatarUrl — reads always populate userId
    // so display data is never stale.
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

    body: { type: String, required: true, maxlength: 1000 },
    helpfulVotes: { type: Number, default: 0 },
    lovedBy: { type: [Schema.Types.ObjectId], ref: "User", default: [] },
    parentId: { type: Schema.Types.ObjectId, ref: "ParagraphComment", index: true },
  },
  { timestamps: true }
);

ParagraphCommentSchema.index({ chapterId: 1, paragraphIndex: 1, parentId: 1 });

export const ParagraphComment =
  (models.ParagraphComment as Model<IParagraphComment>) ?? model<IParagraphComment>("ParagraphComment", ParagraphCommentSchema);