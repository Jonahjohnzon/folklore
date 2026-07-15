// lib/cookie-consent.ts

export type ConsentCategory = "necessary" | "analytics" | "marketing";

export interface CookieConsent {
  necessary: true; // always true, not user-toggleable
  analytics: boolean;
  marketing: boolean;
  decidedAt: string;
}

const STORAGE_KEY = "tipatale-cookie-consent";
const COOKIE_NAME = "tt_consent";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export function loadConsent(): CookieConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CookieConsent) : null;
  } catch {
    return null;
  }
}

export function saveConsent(consent: Omit<CookieConsent, "necessary" | "decidedAt">) {
  const full: CookieConsent = {
    necessary: true,
    ...consent,
    decidedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(full));
    // Also set a plain cookie, readable server-side (middleware/SSR), so
    // e.g. an analytics script injected in layout.tsx can check consent
    // without waiting on a client-side hydration round-trip.
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(
      JSON.stringify({ analytics: full.analytics, marketing: full.marketing })
    )}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
  } catch {
    // localStorage unavailable (privacy mode, etc.) — consent just won't
    // persist across reloads; banner will show again next visit.
  }
  return full;
}

export function acceptAll() {
  return saveConsent({ analytics: true, marketing: true });
}

export function rejectAll() {
  return saveConsent({ analytics: false, marketing: false });
}