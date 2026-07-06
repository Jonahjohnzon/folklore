import { z } from "zod";
export const MIN_SIGNUP_AGE = 13; // baseline join age (COPPA-style floor)
export const MATURE_CONTENT_AGE = 18; // age required before matureContentEnabled can be turned on
import { AuthService } from "@/app/services/auth";
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isValidUsername(username: string): boolean {
  // Matches the Mongoose-level constraints you'd want enforced client-side
  // before ever hitting the unique index: 3-20 chars, letters/numbers/underscore.
  return /^[a-zA-Z0-9_]{3,20}$/.test(username);
}

export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
}

export function getPasswordStrength(password: string): PasswordStrength {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const clamped = Math.min(score, 4) as PasswordStrength["score"];
  const labels = ["Very weak", "Weak", "Fair", "Good", "Strong"];
  return { score: clamped, label: labels[clamped] };
}

/** Builds a real Date from select-driven day/month/year strings, or null if the combination doesn't exist (e.g. Feb 30). */
export function buildDateFromParts(day: string, month: string, year: string): Date | null {
  if (!day || !month || !year) return null;
  const d = Number(day);
  const m = Number(month); // 1-12
  const y = Number(year);
  const date = new Date(y, m - 1, d);
  const isReal = date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
  return isReal ? date : null;
}

export function calculateAge(dob: Date, reference: Date = new Date()): number {
  let age = reference.getFullYear() - dob.getFullYear();
  const hasHadBirthdayThisYear =
    reference.getMonth() > dob.getMonth() ||
    (reference.getMonth() === dob.getMonth() && reference.getDate() >= dob.getDate());
  if (!hasHadBirthdayThisYear) age--;
  return age;
}

// Stub for a real `/api/auth/check-username` call. Swap the body for a
// fetch() once that route exists — the debounced-effect call site in
// UsernameField doesn't need to change.




export async function checkUsernameAvailability(username: string): Promise<boolean> {
  try {
    const res = await AuthService.checkUsernameAvailable(username);
    return res.data.available;
  } catch {
    // fail open on network error — server-side uniqueness check on
    // registerUser is the real backstop, so don't block typing here
    return true;
  }
}

