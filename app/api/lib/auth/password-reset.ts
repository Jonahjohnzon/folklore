// app/api/lib/auth/password-reset.ts
import crypto from "crypto";

const TOKEN_BYTES = 32;
const EXPIRY_MS = 30 * 60 * 1000; // 30 min — shorter than email verify, this is more sensitive

export function generateResetToken() {
  const token = crypto.randomBytes(TOKEN_BYTES).toString("hex");
  const tokenHash = hashResetToken(token);
  const expiresAt = new Date(Date.now() + EXPIRY_MS);
  return { token, tokenHash, expiresAt };
}

export function hashResetToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}