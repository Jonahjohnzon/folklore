// app/api/lib/models/PayoutRequest.ts
import { Schema, model, models, Document } from "mongoose";

export type PayoutRequestStatus = "pending" | "approved" | "paid" | "rejected" | "cancelled";


export interface PayoutRequestDoc extends Document {
  userId: Schema.Types.ObjectId;
  amountCoins: number;
  method: "bank" | "crypto";
  // Snapshot of where-to-pay at request time, so a later profile edit
  // can't silently change where an already-approved payout goes.
  destinationSnapshot: {
    bankName?: string;
    accountNumberMasked?: string;
    accountName?: string;
    cryptoNetwork?: string;
    walletAddressMasked?: string;
  };
  status: PayoutRequestStatus;
  adminNote?: string;
  processedBy?: Schema.Types.ObjectId;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PayoutRequestSchema = new Schema<PayoutRequestDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    amountCoins: { type: Number, required: true, min: 1 },
    method: { type: String, enum: ["bank", "crypto"], required: true },
    destinationSnapshot: {
      bankName: String,
      accountNumberMasked: String,
      accountName: String,
      cryptoNetwork: String,
      walletAddressMasked: String,
    },
    status: { type: String, enum: ["pending", "approved", "paid", "rejected", "cancelled"], default: "pending", index: true },
    adminNote: { type: String, trim: true },
    processedBy: { type: Schema.Types.ObjectId, ref: "User" },
    processedAt: { type: Date },
  },
  { timestamps: true }
);

export const PayoutRequest = models.PayoutRequest || model<PayoutRequestDoc>("PayoutRequest", PayoutRequestSchema);