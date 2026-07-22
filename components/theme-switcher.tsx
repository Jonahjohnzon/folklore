"use client";

import { useState, useRef, useEffect } from "react";
import { useTheme } from "@/context/theme-context";
import type { ThemeName } from "@/lib/types";
import { Palette, Moon, TreePine, Gem, ScrollText, Check, Flower2, Wine, Flower, Sparkles } from "lucide-react";

const THEMES: {
  id: ThemeName;
  label: string;
  swatch: string;
  icon: typeof Moon;
}[] = [
  { id: "parchment", label: "Parchment", swatch: "#c1602b", icon: ScrollText },
  { id: "midnight", label: "Midnight", swatch: "#121019", icon: Moon },
  { id: "coppice", label: "Coppice", swatch: "#16261e", icon: TreePine },
  { id: "quartz", label: "Quartz", swatch: "#ad3f5c", icon: Gem },
  { id: "wisteria", label: "Wisteria", swatch: "#221c2c", icon: Flower2 },
  { id: "rosewood", label: "Rosewood", swatch: "#26161b", icon: Wine },
  { id: "blossom", label: "Blossom", swatch: "#b4677e", icon: Flower },
  { id: "lilac", label: "Lilac", swatch: "#8467a8", icon: Sparkles },
];

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Change reading theme"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-hairline cursor-pointer text-ink-muted transition hover:border-accent hover:text-accent focus-visible:outline focus-visible:outline-accent"
      >
        <Palette size={17} />
      </button>

      {open && (
        <div
          className="fixed right-4 top-16 z-50 w-[calc(100vw-2rem)] max-w-xs overflow-hidden rounded-xl border border-hairline bg-surface-raised p-3 shadow-xl sm:absolute sm:right-0 sm:left-auto sm:top-auto sm:mt-2 sm:w-56 sm:max-w-none"
        >
          <p className="px-0.5 pb-2.5 font-sans text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
            Reading mode
          </p>
          <div className="grid grid-cols-4 gap-2">
            {THEMES.map((t) => {
              const Icon = t.icon;
              const selected = theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setTheme(t.id);
                    setOpen(false);
                  }}
                  title={t.label}
                  aria-label={t.label}
                  aria-pressed={selected}
                  className="group flex flex-col cursor-pointer items-center gap-1.5"
                >
                  <span
                    className="relative flex h-8 w-8 items-center justify-center rounded-full border transition"
                    style={{
                      background: t.swatch,
                      borderColor: selected ? "var(--color-accent, currentColor)" : "transparent",
                      boxShadow: selected
                        ? "0 0 0 2px var(--color-accent, currentColor)"
                        : "0 0 0 1px rgba(0,0,0,0.08)",
                    }}
                  >
                    <Icon size={15} className="text-white/90" strokeWidth={1.75} />
                    {selected && (
                      <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-accent-ink ring-2 ring-surface-raised">
                        <Check size={10} strokeWidth={3} />
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] font-sans text-ink-muted transition group-hover:text-ink text-center leading-tight">
                    {t.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}