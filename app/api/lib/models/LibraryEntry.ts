import { Schema, model, models, Types, Model } from "mongoose";

export type LibraryStatus = "reading" | "want_to_read" | "completed" | "dropped";

export interface ILibraryEntry {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  bookId: Types.ObjectId;
  status: LibraryStatus;
  addedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  lastActivityAt:Date
}

// LibraryEntry.ts
const LibraryEntrySchema = new Schema<ILibraryEntry>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    bookId: { type: Schema.Types.ObjectId, ref: "Book", required: true, index: true },
    status: {
      type: String,
      enum: ["reading", "want_to_read", "completed", "dropped"] satisfies LibraryStatus[],
      required: true,
    },
    addedAt: { type: Date, default: Date.now },
    lastActivityAt: { type: Date, default: Date.now }, // ← new: touched on every chapter open, not just status changes
  },
  { timestamps: true }
);

// One shelf entry per user per book.
LibraryEntrySchema.index({ userId: 1, bookId: 1 }, { unique: true });
// Shelf listing: most recently touched first.
LibraryEntrySchema.index({ userId: 1, status: 1, updatedAt: -1 });

export const LibraryEntry = (models.LibraryEntry as Model<ILibraryEntry>) ?? model<ILibraryEntry>("LibraryEntry", LibraryEntrySchema);