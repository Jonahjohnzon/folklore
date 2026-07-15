"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";
import { loadConsent, saveConsent, acceptAll, rejectAll, type CookieConsent } from "@/lib/cookie-consent";

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    // Only decide after mount — avoids a hydration mismatch, since consent
    // lives in localStorage and isn't known during SSR.
    const existing = loadConsent();
    setVisible(existing === null);
  }, []);

  if (!visible) return null;

  function handleAcceptAll() {
    acceptAll();
    setVisible(false);
  }

  function handleRejectAll() {
    rejectAll();
    setVisible(false);
  }

  function handleSaveCustom() {
    saveConsent({ analytics, marketing });
    setVisible(false);
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-hairline bg-surface px-4 py-4 shadow-2xl sm:px-6">
      <div className="mx-auto flex max-w-4xl flex-col gap-3">
        {!customizing ? (
          <>
            <div className="flex items-start gap-2.5">
              <Cookie size={18} className="mt-0.5 shrink-0 text-accent" />
              <p className="font-sans text-sm text-ink">
                {"We use cookies to keep you signed in and remember your reading preferences. With your permission, we'd also like to use analytics cookies to understand how the site is used. See our "}
                <Link href="/cookie-policy" className="font-medium text-accent hover:underline">
                  Cookie Policy
                </Link>
                {" for details."}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleAcceptAll}
                className="rounded-full bg-accent px-4 py-2 font-sans text-xs font-semibold text-accent-ink hover:opacity-90"
              >
                Accept all
              </button>
              <button
                onClick={handleRejectAll}
                className="rounded-full border border-hairline px-4 py-2 font-sans text-xs font-semibold text-ink hover:border-accent hover:text-accent"
              >
                Reject non-essential
              </button>
              <button
                onClick={() => setCustomizing(true)}
                className="rounded-full px-4 py-2 font-sans text-xs font-medium text-ink-muted hover:text-accent"
              >
                Customize
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="font-sans text-sm font-semibold text-ink">Cookie preferences</p>
              <button onClick={() => setCustomizing(false)} aria-label="Back" className="text-ink-muted hover:text-ink">
                <X size={16} />
              </button>
            </div>

            <ConsentRow
              label="Necessary"
              description="Required for sign-in and core site functionality. Always on."
              checked
              disabled
            />
            <ConsentRow
              label="Analytics"
              description="Helps us understand how readers use TipaTale so we can improve it."
              checked={analytics}
              onChange={setAnalytics}
            />
            <ConsentRow
              label="Marketing"
              description="Used to measure the effectiveness of promotions and campaigns."
              checked={marketing}
              onChange={setMarketing}
            />

            <button
              onClick={handleSaveCustom}
              className="mt-1 self-start rounded-full bg-accent px-4 py-2 font-sans text-xs font-semibold text-accent-ink hover:opacity-90"
            >
              Save preferences
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function ConsentRow({
  label,
  description,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (v: boolean) => void;
}) {
  return (
    <label className={`flex items-start justify-between gap-3 rounded-lg border border-hairline px-3 py-2.5 ${disabled ? "opacity-70" : ""}`}>
      <div>
        <p className="font-sans text-sm font-medium text-ink">{label}</p>
        <p className="font-sans text-xs text-ink-muted">{description}</p>
      </div>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 accent-accent"
      />
    </label>
  );
}