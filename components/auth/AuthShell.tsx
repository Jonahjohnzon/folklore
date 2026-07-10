"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Quote } from "lucide-react";
import Image from "next/image";
interface Excerpt {
  text: string;
  source: string;
}

// Rotating story excerpts — the one signature flourish on these pages.
// Swap this for a real query (e.g. trending/featured chapters) once that
// exists; the shape only needs { text, source }.
const EXCERPTS: Excerpt[] = [
  { text: "Every reader is one page away from their next obsession.", source: "— TipaTale" },
  { text: "The ember court remembers every promise made beneath it.", source: "The Last Ember Court · Ch. 12" },
  { text: "Some stories don't wait to be finished. They wait to be found.", source: "TipaTale community" },
];

export function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % EXCERPTS.length), 6000);
    return () => clearInterval(id);
  }, []);

  const excerpt = EXCERPTS[index];

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Editorial panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-ink px-12 py-12 lg:flex">
        {/* Ambient accent glow — quiet, not animated, just a fixed presence */}
        <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-gold/10 blur-3xl" />

        <Link href="/" className="relative z-10 flex items-center gap-2 font-display text-xl font-semibold text-bg">
          <Image src="/logo.png" alt="TipaTale" width={62} height={62} priority />
        </Link>

        <div key={index} className="relative z-10 max-w-md animate-[fadeIn_0.6s_ease]">
          <Quote size={28} className="mb-4 text-gold" />
          <p className="font-display text-2xl font-medium leading-snug text-bg">
            {excerpt.text}
          </p>
          <p className="mt-4 font-sans text-sm text-bg/60">{excerpt.source}</p>
        </div>

        <p className="relative z-10 font-sans text-xs text-bg/40">
          Stories worth staying up for.
        </p>

        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(6px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="mb-8 flex items-center gap-2 font-display text-xl font-semibold text-ink lg:hidden"
          >
            <Image src="/logo.png" alt="TipaTale" width={62} height={62} priority />
          </Link>

          <p className="font-sans text-xs font-medium uppercase tracking-wide text-accent">{eyebrow}</p>
          <h1 className="mt-1 font-display text-3xl font-bold text-ink">{title}</h1>
          <p className="mt-2 font-sans text-sm text-ink-muted">{subtitle}</p>

          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}