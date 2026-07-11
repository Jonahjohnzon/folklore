// lib/auth/email-verification.ts
import crypto from "crypto";

export const EMAIL_VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000; // 24h

// Plaintext token goes in the emailed link; only the hash is stored, same
// pattern you'd want for password reset tokens — a DB leak doesn't hand out
// working verification links.
export function generateVerificationToken() {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS);
  return { token, tokenHash, expiresAt };
}

export function hashVerificationToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}