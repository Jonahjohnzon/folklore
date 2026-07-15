// components/cookie-consent-banner.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { loadConsent, saveConsent, acceptAll, rejectAll } from "@/lib/cookie-consent";

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
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
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-hairline bg-surface">
      <div className="mx-auto max-w-5xl px-4 py-3 sm:px-6">
        {!customizing ? (
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-sans text-xs leading-relaxed text-ink-muted sm:text-sm">
              {"We use cookies to keep you signed in and improve TipaTale. "}
              <Link href="/cookie-policy" className="font-medium text-accent hover:underline">
                Cookie Policy
              </Link>
            </p>

            <div className="flex shrink-0 items-center gap-2">
              <button
                onClick={() => setCustomizing(true)}
                className="px-2.5 py-1.5 font-sans text-xs font-medium text-ink-muted transition hover:text-accent"
              >
                Customize
              </button>
              <button
                onClick={handleRejectAll}
                className="border border-hairline px-3 py-1.5 font-sans text-xs font-semibold text-ink transition hover:border-ink"
              >
                Reject
              </button>
              <button
                onClick={handleAcceptAll}
                className="bg-accent px-3 py-1.5 font-sans text-xs font-semibold text-accent-ink transition hover:opacity-90"
              >
                Accept all
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="font-sans text-sm font-semibold text-ink">Cookie preferences</p>
              <button
                onClick={() => setCustomizing(false)}
                aria-label="Back"
                className="text-ink-muted transition hover:text-ink"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <ConsentTile
                label="Necessary"
                description="Always on — required for sign-in."
                checked
                disabled
              />
              <ConsentTile
                label="Analytics"
                description="Helps us improve the site."
                checked={analytics}
                onChange={setAnalytics}
              />
              <ConsentTile
                label="Marketing"
                description="Measures promotions."
                checked={marketing}
                onChange={setMarketing}
              />
            </div>

            <button
              onClick={handleSaveCustom}
              className="self-start bg-accent px-3 py-1.5 font-sans text-xs font-semibold text-accent-ink transition hover:opacity-90"
            >
              Save preferences
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ConsentTile({
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
    <label
      className={`flex items-center justify-between gap-2 border px-2.5 py-2 transition ${
        checked ? "border-accent" : "border-hairline"
      } ${disabled ? "opacity-70" : "cursor-pointer"}`}
    >
      <div>
        <p className="font-sans text-xs font-semibold text-ink">{label}</p>
        <p className="font-sans text-[11px] leading-snug text-ink-muted">{description}</p>
      </div>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
        className="h-3.5 w-3.5 shrink-0 accent-accent"
      />
    </label>
  );
}