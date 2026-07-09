"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthService } from "@/app/services/auth";
import { getErrorMessage } from "@/lib/api/errors";
import { hydrateStore } from "@/app/store/StoreHydrator";

declare global {
  interface Window {
    google?: any;
  }
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;

export function SocialAuthDivider() {
  return (
    <div className="my-6 flex items-center gap-3">
      <div className="h-px flex-1 bg-hairline" />
      <span className="font-sans text-xs uppercase tracking-wide text-ink-muted">or</span>
      <div className="h-px flex-1 bg-hairline" />
    </div>
  );
}

export function SocialAuthButtons() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  async function handleGoogleCredential(response: { credential: string }) {
    setError(null);
    setLoading(true);
    try {
      await AuthService.googleSignIn(response.credential);
      await hydrateStore();
      router.push("/");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  function initGoogle() {
    if (!window.google || !googleBtnRef.current) return;
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleCredential,
    });
    // Rendered at a real, clickable size — GSI ignores clicks on 0x0 elements —
    // but visually hidden so our own styled button can sit on top of it.
    window.google.accounts.id.renderButton(googleBtnRef.current, {
      theme: "outline",
      size: "large",
      width: 240,
    });
  }

  useEffect(() => {
    initGoogle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleCustomGoogleClick() {
    // Forward the click to Google's real (hidden) button, since GSI doesn't
    // allow restyling its own button to match custom designs.
    const realBtn = googleBtnRef.current?.querySelector('div[role="button"]') as HTMLElement | null;
    realBtn?.click();
  }

  return (
    <>
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onLoad={initGoogle} />

      {/* Real Google button — invisible but present in the DOM and clickable */}
      <div
        ref={googleBtnRef}
        className="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0"
        aria-hidden
      />

      <div className="grid grid-cols-1 gap-3">
        <button
          type="button"
          onClick={handleCustomGoogleClick}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-lg border border-hairline bg-bg py-2.5 font-sans text-sm font-medium text-ink transition hover:border-accent/50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <GoogleIcon />
          {loading ? "Signing in…" : "Continue with Google"}
        </button>
      </div>

      {error && (
        <p className="mt-3 rounded-lg border border-red-300 bg-red-50 px-3.5 py-2 font-sans text-xs text-red-700">
          {error}
        </p>
      )}
    </>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.87c2.27-2.09 3.58-5.17 3.58-8.82z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.87-3c-1.08.72-2.45 1.15-4.08 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.11A11.99 11.99 0 0 0 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28V6.61H1.27A11.99 11.99 0 0 0 0 12c0 1.94.46 3.77 1.27 5.39l4-3.11z"
      />
      <path
        fill="#EA4335"
        d="M12 4.76c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.69 1.27 6.61l4 3.11C6.22 6.87 8.87 4.76 12 4.76z"
      />
    </svg>
  );
}