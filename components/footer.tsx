"use client";

import Link from "next/link";

const PRIMARY_LINKS: { label: string; href: string }[] = [
  { label: "Browse", href: "/browse/new" },
  { label: "Trending", href: "/browse/trending" },
  { label: "Buy coins", href: "/coins" },
  { label: "Get the App", href: "/app" },
  { label: "Start writing", href: "/write" },
];

const PARTNER_LINKS: { label: string; href: string }[] = [
  { label: "About TipaTale", href: "/about" },
  { label: "Careers", href: "/careers" },
];

const LEGAL_LINKS: { label: string; href: string }[] = [
  { label: "Terms", href: "/terms" },
  { label: "Privacy", href: "/privacy" },
  { label: "Report content", href: "/report" },
  { label: "Help", href: "/help" },
];

export function Footer() {
  return (
    <footer className="border-t border-hairline bg-bg">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* Row 1 — bold primary nav, centered, wraps on small screens */}
        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          {PRIMARY_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="font-sans text-sm font-semibold text-ink transition hover:text-accent"
            >
              {l.label}
            </Link>
          ))}

          <span className="text-hairline">|</span>

          {PARTNER_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="font-sans text-xs sm:text-sm font-semibold text-ink transition hover:text-accent"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Row 2 — muted legal row + copyright, centered */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
          {LEGAL_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="font-sans text-[12px] sm:text-xs font-medium text-ink-muted transition hover:text-accent"
            >
              {l.label}
            </Link>
          ))}
          <span className="font-sans text-[10px] sm:text-xs text-ink-muted">
            © {new Date().getFullYear()} TipaTale
          </span>
        </div> 
      </div>
    </footer>
  );
}