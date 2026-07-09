// lib/reader-swipe-onboarding.ts
const KEY = "lore-reader-swipe-onboarded";

export function hasSeenSwipeOnboarding(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return true;
  }
}

export function markSwipeOnboardingSeen() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, "1");
  } catch {}
}