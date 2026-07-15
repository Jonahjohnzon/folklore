import { Schema, model, models, Types, Model } from "mongoose";
import type { UserMode, AccountStatus, CreatorStatus } from "../types";

// ── Interface ─────────────────────────────────────────────────
export interface IUser {
  _id: Types.ObjectId;

  // auth
  email: string;
  passwordHash: string;
  passwordResetTokenHash?: string | null;
  passwordResetExpires?: Date | null;
  passwordResetLastSentAt?: Date | null;

  // public identity
  username: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;

  // mode toggle
  activeMode: UserMode;

  // creator fields
  penName?: string;
  creatorStatus: CreatorStatus;
  creatorActivatedAt?: Date;

  // account health
  status: AccountStatus;
  emailVerified: boolean;
  matureContentEnabled: boolean;

  // compliance — added for signup age-gating
  dateOfBirth: Date;
  marketingOptIn: boolean;
  termsAcceptedAt: Date;
  role: string;
  // personalisation blob
  preferences: Record<string, unknown>;
  coinBalance:number;
  avatarPublicId:string
  createdAt: Date;
  updatedAt: Date;
  onboardingCompletedAt?: Date;
  verifiedAuthor: boolean;
  interestTags: Types.ObjectId[];
  readingStats: {
    chaptersReadCount: number;
    currentStreak: number;
    longestStreak: number;
    lastReadDate: Date | null;
  };
  blockedUsers: Types.ObjectId[];
  googleId?: string;
  authProviders: string[];
  emailVerificationTokenHash:string | null;
  emailVerificationExpires:Date | null;
  emailVerificationLastSentAt:Date;
  websiteUrl:string
  emailChangedAt?: Date | null;
}

// ── Schema ────────────────────────────────────────────────────
const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String},
    passwordResetTokenHash: { type: String, default: null, select: false },
    passwordResetExpires: { type: Date, default: null, select: false },
    passwordResetLastSentAt: { type: Date, default: null, select: false },
    avatarPublicId:{ type: String},
    username: { type: String, required: true, unique: true, trim: true },
    displayName: { type: String },
    avatarUrl: { type: String },
    bio: { type: String },
    websiteUrl: {type: String },
    activeMode: {
      type: String,
      enum: ["reader", "creator"] satisfies UserMode[],
      default: "reader",
    },
    verifiedAuthor: { type: Boolean, default: false, index: true },
    penName: { type: String, unique: true, sparse: true },
    creatorStatus: {
      type: String,
      enum: ["not_applied", "pending", "active", "suspended"] satisfies CreatorStatus[],
      default: "not_applied",
      index: true,
    },
    creatorActivatedAt: { type: Date },
    emailChangedAt: { type: Date, default: null },
    status: {
      type: String,
      enum: ["active", "suspended", "deleted"] satisfies AccountStatus[],
      default: "active",
    },
    emailVerified: { type: Boolean, default: false },
    emailVerificationTokenHash: { type: String, default: null, select: false },
    emailVerificationExpires: { type: Date, default: null, select: false },
    emailVerificationLastSentAt: { type: Date, default: null, select: false },
    matureContentEnabled: { type: Boolean, default: false },
    role: { type: String, enum: ["user", "moderator", "admin"], default: "user", index: true },
    dateOfBirth: { type: Date},
    marketingOptIn: { type: Boolean, default: false },
    termsAcceptedAt: { type: Date, required: true },

    preferences: { type: Schema.Types.Mixed, default: {} },
    onboardingCompletedAt: { type: Date },
    coinBalance:{type:Number},
    interestTags: [{ type: Schema.Types.ObjectId, ref: "Tag", default: [] }],
    readingStats: {
      chaptersReadCount: { type: Number, default: 0 },
      currentStreak: { type: Number, default: 0 },
      longestStreak: { type: Number, default: 0 },
      lastReadDate: { type: Date, default: null },
    },
    blockedUsers: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
    googleId: { type: String, unique: true, sparse: true },
    authProviders: { type: [String], default: ["password"] }, 
  },
  { timestamps: true }
);

UserSchema.index({ username: "text", displayName: "text", penName: "text" });

export const User = (models.User as Model<IUser>) ?? model<IUser>("User", UserSchema);