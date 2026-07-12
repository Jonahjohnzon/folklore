// app/api/lib/models/PayoutAccount.ts
import { Schema, model, models, Document } from "mongoose";

export type PayoutMethod = "bank" | "crypto";

export interface PayoutAccountDoc extends Document {
  userId: Schema.Types.ObjectId;
  method: PayoutMethod;
  bankName?: string;
  bankCode?: string;
  accountNumberEnc?: string;
  accountName?: string;
  cryptoNetwork?: string;
  walletAddressEnc?: string;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PayoutAccountSchema = new Schema<PayoutAccountDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    method: { type: String, enum: ["bank", "crypto"], required: true },
    bankName: { type: String, trim: true },
    bankCode: { type: String, trim: true },
    accountNumberEnc: { type: String },
    accountName: { type: String, trim: true },
    cryptoNetwork: { type: String, trim: true },
    walletAddressEnc: { type: String },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const PayoutAccount = models.PayoutAccount || model<PayoutAccountDoc>("PayoutAccount", PayoutAccountSchema);