// app/api/lib/models/Sound.ts
import { Schema, model, models, Document } from "mongoose";

export type SoundCategory = "ambience" | "impact" | "nature" | "music_sting";

export interface SoundDoc extends Document {
  label: string;
  category: SoundCategory;
  url: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SoundSchema = new Schema<SoundDoc>(
  {
    label: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["ambience", "impact", "nature", "music_sting"],
      required: true,
    },
    url: { type: String, required: true, trim: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Sound = models.Sound || model<SoundDoc>("Sound", SoundSchema);