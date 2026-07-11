"use client"
import Link from "next/link";
import { Bird, Camera, Play, Coins } from "lucide-react";
import Image from "next/image";
const COLUMNS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "Discover",
    links: [
      { label: "New releases", href: "/browse/new" },
      { label: "Fantasy", href: "/browse/fantasy" },
      { label: "Romance", href: "/browse/romance" },
      { label: "Sci-Fi", href: "/browse/sci-fi" },
    ],
  },
  {
    heading: "Write",
    links: [
      { label: "Start writing", href: "/write" },
      { label: "Community guidelines", href: "/guidelines" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Help center", href: "/help" },
      { label: "Coins & billing", href: "/coins" },
      { label: "Report content", href: "/report" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About TipaTale", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Terms of service", href: "/terms" },
      { label: "Privacy policy", href: "/privacy" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-hairline bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_repeat(4,1fr)]">
          {/* Brand + newsletter */}
          <div>
            <Link href="/" className="flex items-center gap-2 font-display text-xl font-semibold text-ink">
                     <Image src="/logo.png" alt="TipaTale" width={62} height={62} priority />
                     <span>TipaTale</span>
            </Link>
            <p className="mt-3 max-w-xs font-body text-sm leading-relaxed text-ink-muted">
              Serialized fiction worth staying up for. Read free, support the
              authors you love, write your own.
            </p>
            <p className="mt-2 font-sans text-xs text-ink-muted">
              New chapters and creator spotlights, twice a month.
            </p>

            <div className="mt-5 flex items-center gap-3">
              <a href="#" aria-label="Twitter" className="flex h-8 w-8 items-center justify-center rounded-full border border-hairline text-ink-muted hover:border-accent hover:text-accent">
                <Bird size={14} />
              </a>
              <a href="#" aria-label="Instagram" className="flex h-8 w-8 items-center justify-center rounded-full border border-hairline text-ink-muted hover:border-accent hover:text-accent">
                <Camera size={14} />
              </a>
              <a href="#" aria-label="YouTube" className="flex h-8 w-8 items-center justify-center rounded-full border border-hairline text-ink-muted hover:border-accent hover:text-accent">
                <Play size={14} />
              </a>
            </div>
          </div>

          {/* Link columns */}
          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <h3 className="font-sans text-xs font-semibold uppercase tracking-wide text-ink-muted">
                {col.heading}
              </h3>
              <ul className="mt-3 flex flex-col gap-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="font-sans text-sm text-ink transition hover:text-accent">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-start gap-3 border-t border-hairline pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-sans text-xs text-ink-muted">© {new Date().getFullYear()} TipaTale. All rights reserved.</p>
          <div className="flex items-center gap-1.5 font-sans text-xs text-ink-muted">
            <Coins size={13} className="text-gold" />
            Coins are non-refundable virtual currency.{" "}
          </div>
        </div>
      </div>
    </footer>
  );
}
