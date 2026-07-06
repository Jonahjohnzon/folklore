"use client";

export function SocialAuthDivider() {
  return (
    <div className="my-6 flex items-center gap-3">
      <div className="h-px flex-1 bg-hairline" />
      <span className="font-sans text-xs text-ink-muted">or continue with</span>
      <div className="h-px flex-1 bg-hairline" />
    </div>
  );
}

export function SocialAuthButtons() {
  // Placeholder only — wire each onClick to your real OAuth flow
  // (e.g. signIn("google") / signIn("apple") if you're on NextAuth).
  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        className="flex items-center justify-center gap-2 rounded-lg border border-hairline bg-bg py-2.5 font-sans text-sm font-medium text-ink transition hover:border-accent/50"
      >
        <GoogleIcon />
        Google
      </button>
      <button
        type="button"
        className="flex items-center justify-center gap-2 rounded-lg border border-hairline bg-bg py-2.5 font-sans text-sm font-medium text-ink transition hover:border-accent/50"
      >
        <AppleIcon />
        Apple
      </button>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.85A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.05H2.18A11 11 0 0 0 1 12c0 1.77.43 3.45 1.18 4.95z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.05L5.84 9.9C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.36 1.43c0 1.14-.42 2.2-1.25 3.05-.83.85-1.86 1.34-2.99 1.27-.12-1.1.36-2.24 1.18-3.06.84-.84 2.05-1.46 3.06-1.5.0.08 0 .16 0 .24zM20.5 17.18c-.5 1.16-1.1 2.27-1.9 3.3-.96 1.27-1.95 2.52-3.5 2.55-1.5.03-1.98-.9-3.7-.9-1.71 0-2.25.87-3.67.93-1.5.06-2.65-1.36-3.62-2.62-1.96-2.59-3.49-7.32-1.46-10.52a5.36 5.36 0 0 1 4.5-2.7c1.46-.03 2.84.97 3.72.97.88 0 2.54-1.2 4.29-1.03.73.03 2.78.29 4.1 2.21-.11.07-2.45 1.4-2.42 4.19.03 3.32 2.95 4.42 2.98 4.43-.03.08-.46 1.5-1.32 2.99z" />
    </svg>
  );
}