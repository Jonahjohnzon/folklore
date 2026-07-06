// models/Badge.ts
import { Schema, model, models, Types, Model } from "mongoose";

export type BadgeCategory = "reading_milestone" | "streak";

export interface IBadge {
  _id: Types.ObjectId;
  key: string;
  category: BadgeCategory;
  tier: number;
  name: string;
  threshold: number;
  active: boolean;
  createdAt: Date;
}

const BadgeSchema = new Schema<IBadge>(
  {
    key: { type: String, required: true, unique: true },
    category: { type: String, enum: ["reading_milestone", "streak"], required: true, index: true },
    tier: { type: Number, required: true, min: 1, max: 5 },
    name: { type: String, required: true },
    threshold: { type: Number, required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Badge = (models.Badge as Model<IBadge>) ?? model<IBadge>("Badge", BadgeSchema);