// app/api/lib/models/PromoBanner.ts
import { Schema, model, models, Document } from "mongoose";

export type PromoBannerType = "books" | "announcement";

export interface PromoBookEntry {
  title: string;
  coverUrl: string;
  href: string;
}

export interface PromoBannerDoc extends Document {
  type: PromoBannerType;
  heading: string;
  accent: string;
  bgColor: string;
  waveColor: string;
  // "books" type only:
  books: PromoBookEntry[];
  // "announcement" type only — the whole banner is one link:
  imageUrl?: string;
  linkUrl?: string;
  linkLabel?: string;
  openInNewTab: boolean;
  active: boolean;
  order: number;
  startsAt?: Date;
  endsAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PromoBannerSchema = new Schema<PromoBannerDoc>(
  {
    type: { type: String, enum: ["books", "announcement"], required: true, default: "books" },
    heading: { type: String, trim: true, required: true },
    accent: { type: String, trim: true, default: "" },
    bgColor: { type: String, trim: true, default: "#C81854" },
    waveColor: { type: String, trim: true, default: "#FF9478" },
    books: [
      {
        title: { type: String, trim: true },
        coverUrl: { type: String, trim: true },
        href: { type: String, trim: true },
      },
    ],
    imageUrl: { type: String, trim: true },
    linkUrl: { type: String, trim: true },
    linkLabel: { type: String, trim: true },
    openInNewTab: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    startsAt: { type: Date },
    endsAt: { type: Date },
  },
  { timestamps: true }
);

export const PromoBanner = models.PromoBanner || model<PromoBannerDoc>("PromoBanner", PromoBannerSchema);