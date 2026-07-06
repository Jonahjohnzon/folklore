import { Schema, model, models, Types, Model } from "mongoose";
import { DEFAULT_SHEET_THEME_ID } from "@/lib/sheet-themes";

export interface IBookTheme {
  _id: Types.ObjectId;
  bookId: Types.ObjectId;

  // typography
  fontFamily: string;
  fontSizeBase: number; // px
  lineHeight: number;

  // colors (hex) — kept for custom/derived rendering, chapter cards, etc.
  bgColor: string;
  textColor: string;
  accentColor: string;
  linkColor: string;

  // sheet/paper preset — source of truth for reader background
  sheetThemeId: string;
  textureUrl?: string;

  // background ambience
  bgMusicUrl?: string;
  bgMusicVolume: number; // 0.0 – 1.0

  // escape hatch
  customCss?: string;

  createdAt: Date;
  updatedAt: Date;
locks: { theme: boolean; font: boolean; sound: boolean };
}

const BookThemeSchema = new Schema<IBookTheme>(
  {
    bookId: {
      type: Schema.Types.ObjectId,
      ref: "Book",
      required: true,
      unique: true,
    },

    fontFamily: { type: String, default: "Georgia" },
    fontSizeBase: { type: Number, default: 16 },
    lineHeight: { type: Number, default: 1.7 },

    bgColor: { type: String, default: "#FFFFFF" },
    textColor: { type: String, default: "#1A1A1A" },
    accentColor: { type: String, default: "#8B5CF6" },
    linkColor: { type: String, default: "#6D28D9" },

    sheetThemeId: { type: String, default: DEFAULT_SHEET_THEME_ID },
    textureUrl: { type: String },

    bgMusicUrl: { type: String },
    bgMusicVolume: { type: Number, default: 0.2, min: 0, max: 1 },

    customCss: { type: String },
    locks: {
      theme: { type: Boolean, default: false },
      font: { type: Boolean, default: false },
      sound: { type: Boolean, default: false },
      _id: false,
    },
  },
  { timestamps: true }
);

export const BookTheme =
  (models.BookTheme as Model<IBookTheme>) ?? model<IBookTheme>("BookTheme", BookThemeSchema);