import { Schema, model, models, Types, Model } from "mongoose";
import type { UserMode, AccountStatus, CreatorStatus } from "../types";

// ── Interface ─────────────────────────────────────────────────
export interface IUser {
  _id: Types.ObjectId;

  // auth
  email: string;
  passwordHash: string;

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

}

// ── Schema ────────────────────────────────────────────────────
const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },

    username: { type: String, required: true, unique: true, trim: true },
    displayName: { type: String },
    avatarUrl: { type: String },
    bio: { type: String },

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

    status: {
      type: String,
      enum: ["active", "suspended", "deleted"] satisfies AccountStatus[],
      default: "active",
    },
    emailVerified: { type: Boolean, default: false },
    matureContentEnabled: { type: Boolean, default: false },
    role: { type: String, enum: ["user", "moderator", "admin"], default: "user", index: true },
    dateOfBirth: { type: Date, required: true },
    marketingOptIn: { type: Boolean, default: false },
    termsAcceptedAt: { type: Date, required: true },

    preferences: { type: Schema.Types.Mixed, default: {} },
    onboardingCompletedAt: { type: Date },
    interestTags: [{ type: Schema.Types.ObjectId, ref: "Tag", default: [] }],
    readingStats: {
      chaptersReadCount: { type: Number, default: 0 },
      currentStreak: { type: Number, default: 0 },
      longestStreak: { type: Number, default: 0 },
      lastReadDate: { type: Date, default: null },
    },
    blockedUsers: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
  },
  { timestamps: true }
);

UserSchema.index({ username: "text", displayName: "text", penName: "text" });

export const User = (models.User as Model<IUser>) ?? model<IUser>("User", UserSchema);