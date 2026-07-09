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
  const googleBtnRef = useRef<HTMLDivElement>(null);

  async function handleGoogleCredential(response: { credential: string }) {
    setError(null);
    try {
      await AuthService.googleSignIn(response.credential);
      await hydrateStore()
      router.push("/");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  function initGoogle() {
    if (!window.google || !googleBtnRef.current) return;
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleCredential,
    });
    window.google.accounts.id.renderButton(googleBtnRef.current, {
      theme: "outline",
      size: "large",
      width: "100%",
      text: "continue_with",
    });
  }

  

  
  useEffect(() => {
    initGoogle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={initGoogle}
      />


      <div className="flex flex-col gap-3">
        <div ref={googleBtnRef} className="flex justify-center [&>div]:w-full!" />

        {error && (
          <p className="rounded-lg border border-red-300 bg-red-50 px-3.5 py-2 font-sans text-xs text-red-700">
            {error}
          </p>
        )}
      </div>
    </>
  );
}

