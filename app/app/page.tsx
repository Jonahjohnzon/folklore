import { Mail, Smartphone } from "lucide-react";

export default function MobileAppPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-bg px-4 py-16 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-hairline bg-surface shadow-sm">
        <Smartphone size={28} className="text-accent" />
      </div>

      <h1 className="font-display text-3xl font-bold text-ink sm:text-5xl">
        Tipatale, on the go
      </h1>
      <p className="mt-4 max-w-md font-sans text-base text-ink-muted sm:text-lg">
        Our mobile app is on its way. Read, unlock chapters, and pick up right where you left off — from your pocket.
      </p>

      <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 font-sans text-xs font-semibold text-accent">
        Coming soon
      </div>

      {/* Disabled store badges — swap the hrefs in once the app is live */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <div className="flex cursor-not-allowed items-center gap-2 rounded-lg border border-hairline bg-surface px-4 py-2.5 opacity-50">
          <AppleIcon />
          <div className="text-left">
            <p className="font-sans text-[10px] leading-none text-ink-muted">Coming soon on the</p>
            <p className="font-sans text-sm font-semibold leading-tight text-ink">App Store</p>
          </div>
        </div>
        <div className="flex cursor-not-allowed items-center gap-2 rounded-lg border border-hairline bg-surface px-4 py-2.5 opacity-50">
          <PlayIcon />
          <div className="text-left">
            <p className="font-sans text-[10px] leading-none text-ink-muted">Coming soon on</p>
            <p className="font-sans text-sm font-semibold leading-tight text-ink">Google Play</p>
          </div>
        </div>
      </div>

      <form className="mt-10 flex w-full max-w-sm items-center gap-2">
        <div className="relative flex-1">
          <Mail size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            type="email"
            placeholder="you@example.com"
            className="w-full rounded-full border border-hairline bg-surface py-2.5 pl-9 pr-3 font-sans text-sm text-ink outline-none focus:border-accent"
          />
        </div>
        <button
          type="submit"
          className="shrink-0 rounded-full bg-accent px-5 py-2.5 font-sans text-sm font-semibold text-white transition hover:opacity-90"
        >
          Notify me
        </button>
      </form>
      <p className="mt-3 font-sans text-xs text-ink-muted">
        We&apos;ll email you the moment it launches. No spam.
      </p>
    </main>
  );
}

function AppleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-ink">
      <path d="M17.05 12.536c-.02-2.05 1.68-3.036 1.756-3.084-.958-1.4-2.448-1.592-2.98-1.612-1.27-.13-2.478.748-3.122.748-.644 0-1.638-.73-2.694-.71-1.386.02-2.664.806-3.376 2.048-1.442 2.498-.368 6.192 1.036 8.218.686.99 1.502 2.104 2.576 2.064 1.034-.042 1.424-.668 2.674-.668 1.25 0 1.6.668 2.696.646 1.114-.02 1.82-1.008 2.502-2.004.79-1.148 1.114-2.26 1.132-2.318-.024-.012-2.174-.834-2.2-3.328zM15.014 5.24c.57-.69.956-1.652.85-2.61-.822.034-1.816.548-2.406 1.236-.528.61-.99 1.59-.866 2.526.914.07 1.85-.464 2.422-1.152z"/>
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-ink">
      <path d="M3 3.5v17c0 .3.16.57.42.7l9.2-9.2-9.2-9.2c-.26.13-.42.4-.42.7zM14.6 12l2.55-2.55L4.7 2.66a.9.9 0 00-.5-.14l10.4 9.48zm0 0L4.2 21.48c.17.06.35.1.5.06l12.45-6.79L14.6 12zm3.6-1.65l-2.72 1.5 2.72 1.5 2.66-1.47a.85.85 0 000-1.06l-2.66-1.47z"/>
    </svg>
  );
}