import { Schema, model, models, Types, Model } from "mongoose";

export type ReportType = "book" | "chapter" | "comment" | "user" | "other";
export type ReportReason =
  | "copyright"
  | "harassment"
  | "spam"
  | "untagged_mature"
  | "impersonation"
  | "underage"
  | "other";
export type ReportStatus = "open" | "reviewing" | "resolved" | "dismissed";

export interface IReport {
  _id: Types.ObjectId;
  type: ReportType;
  reason: ReportReason;
  url?: string;
  description: string;
  email?: string;
  reporterId?: Types.ObjectId | null;
  status: ReportStatus;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    type: {
      type: String,
      enum: ["book", "chapter", "comment", "user", "other"] satisfies ReportType[],
      required: true,
    },
    reason: {
      type: String,
      enum: [
        "copyright",
        "harassment",
        "spam",
        "untagged_mature",
        "impersonation",
        "underage",
        "other",
      ] satisfies ReportReason[],
      required: true,
    },
    url: { type: String },
    description: { type: String, required: true },
    email: { type: String },
    reporterId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    status: {
      type: String,
      enum: ["open", "reviewing", "resolved", "dismissed"] satisfies ReportStatus[],
      default: "open",
      index: true,
    },
  },
  { timestamps: true }
);

ReportSchema.index({ createdAt: -1 });
ReportSchema.index({ status: 1, createdAt: -1 });

export const Report = (models.Report as Model<IReport>) ?? model<IReport>("Report", ReportSchema);