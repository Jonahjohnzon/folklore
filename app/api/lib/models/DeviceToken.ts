// app/api/lib/models/DeviceToken.ts
import mongoose, { Schema } from "mongoose";

export interface DeviceTokenDoc {
  userId: string;
  token: string;
  platform: "ios" | "android" | "web";
  createdAt: Date;
}

const DeviceTokenSchema = new Schema<DeviceTokenDoc>({
  userId: { type: String, required: true, index: true },
  token: { type: String, required: true, unique: true },
  platform: { type: String, enum: ["ios", "android", "web"], required: true },
  createdAt: { type: Date, default: Date.now },
});

export const DeviceToken =
  mongoose.models.DeviceToken || mongoose.model<DeviceTokenDoc>("DeviceToken", DeviceTokenSchema);