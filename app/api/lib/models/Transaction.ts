import { Schema, model, models, Types, Model } from "mongoose";

// ── Enums ─────────────────────────────────────────────────────
export type TransactionType =
  | "purchase"        // coins bought via Paystack or crypto
  | "chapter_unlock"  // coins spent unlocking paid content
  | "tip"             // coins sent to a creator
  | "refund"          // coins returned to the user
  | "bonus"           // promo/signup/streak bonus credit
  | "adjustment";     // manual admin correction (+/-)

export type TransactionStatus = "pending" | "completed" | "failed" | "reversed";

export type PaymentMethod = "paystack" | "crypto" | null;

// ── Interface ─────────────────────────────────────────────────
export interface ITransaction {
  _id: Types.ObjectId;
  userId: Types.ObjectId;

  type: TransactionType;
  status: TransactionStatus;

  // coins is signed: positive = credit to balance, negative = debit
  coins: number;
  balanceAfter?: number;

  label: string; // human-readable line for activity feed, e.g. "Bought 500 coins"

  // purchase-specific
  paymentMethod: PaymentMethod;
  packageId?: string;
  amount?: number;        // major currency unit charged (e.g. naira or dollars)
  currency?: "NGN" | "USD";
  providerReference?: string; // Paystack reference / crypto tx hash or invoice id

  // spend-specific
  chapterId?: Types.ObjectId;
  storyId?: Types.ObjectId;
  recipientUserId?: Types.ObjectId; // creator tipped, or chapter author

  // free-form provider payload / admin notes
  metadata?: Record<string, unknown>;

  createdAt: Date;
  updatedAt: Date;
}

// ── Schema ────────────────────────────────────────────────────
const TransactionSchema = new Schema<ITransaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

    type: {
      type: String,
      enum: [
        "purchase",
        "chapter_unlock",
        "tip",
        "refund",
        "bonus",
        "adjustment",
      ] satisfies TransactionType[],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "reversed"] satisfies TransactionStatus[],
      default: "completed",
      index: true,
    },

    coins: { type: Number, required: true },
    balanceAfter: { type: Number },

    label: { type: String, required: true },

    paymentMethod: {
      type: String,
      enum: ["paystack", "crypto", null],
      default: null,
    },
    packageId: { type: String },
    amount: { type: Number },
    currency: { type: String, enum: ["NGN", "USD"] },
    providerReference: { type: String },

    chapterId: { type: Schema.Types.ObjectId, ref: "Chapter" },
    storyId: { type: Schema.Types.ObjectId, ref: "Story" },
    recipientUserId: { type: Schema.Types.ObjectId, ref: "User" },

    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

// Activity feed: most recent transactions per user
TransactionSchema.index({ userId: 1, createdAt: -1 });

// Prevent double-processing the same provider callback
TransactionSchema.index(
  { providerReference: 1 },
  { unique: true, sparse: true }
);

export const Transaction =
  (models.Transaction as Model<ITransaction>) ?? model<ITransaction>("Transaction", TransactionSchema);