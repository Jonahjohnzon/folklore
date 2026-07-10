// components/email-verification-banner.tsx
"use client";

import { useState } from "react";
import { useSnapshot } from "valtio";
import { Mail, X, Loader2 } from "lucide-react";
import { store } from "@/app/store/userStore";
import { AuthService } from "@/app/services/auth";

export function EmailVerificationBanner() {
  const snap = useSnapshot(store);
  const [dismissed, setDismissed] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!snap.authChecked || !snap.username || snap.emailVerified !== false || dismissed) {
    return null;
  }

  async function handleResend() {
    setSending(true);
    setError(null);
    try {
      await AuthService.resendVerification();
      setSent(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || "Couldn't send the email — try again shortly.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-2.5 sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-sans text-sm text-amber-900">
          <Mail size={15} className="shrink-0" />
          {sent ? "Verification email sent — check your inbox and spam." : "Please verify your email address."}
          {error && <span className="text-red-700">{error}</span>}
        </div>

        <div className="flex items-center gap-3">
          {!sent && (
            <button
              onClick={handleResend}
              disabled={sending}
              className="flex items-center gap-1.5 rounded-full border border-amber-300 bg-white px-3 py-1 font-sans text-xs font-semibold text-amber-900 transition hover:border-amber-400 disabled:opacity-50"
            >
              {sending && <Loader2 size={12} className="animate-spin" />}
              {sending ? "Sending…" : "Resend email"}
            </button>
          )}
          <button onClick={() => setDismissed(true)} aria-label="Dismiss" className="text-amber-700 hover:text-amber-900">
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}