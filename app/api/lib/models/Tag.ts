import { Schema, model, models, Types,Model } from "mongoose";
import type { TagCategory } from "../types";

export interface ITag {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  category: TagCategory;
  usageCount: number;
  createdAt: Date;
}

const TagSchema = new Schema<ITag>(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    category: {
      type: String,
      enum: [
        "genre",
        "mood",
        "trope",
        "content_warning",
        "setting",
        "custom",
      ] satisfies TagCategory[],
      default: "genre",
      index: true,
    },
    usageCount: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);


export const Tag = (models.Tag as Model<ITag>) ?? model<ITag>("Tag", TagSchema);

// NOTE: The SQL book_tags join table is replaced by Book.tags: ObjectId[]
//       Use Book.find({ tags: tagId }) to look up books by tag.