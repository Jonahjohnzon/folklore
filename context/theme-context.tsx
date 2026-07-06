"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { ThemeName } from "@/lib/types";

interface ThemeCtx {
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
}

const ThemeContext = createContext<ThemeCtx | undefined>(undefined);

const STORAGE_KEY = "lore-theme";
const DEFAULT_THEME: ThemeName = "parchment";

function getInitialTheme(): ThemeName {
  if (typeof window === "undefined") return DEFAULT_THEME;
  // The blocking script in layout.tsx already set this attribute
  // before paint — read it back so React's first render matches
  // what's already on screen instead of starting from the default
  // and re-rendering a moment later.
  const fromDom = document.documentElement.getAttribute("data-theme") as ThemeName | null;
  if (fromDom) return fromDom;
  const stored = window.localStorage.getItem(STORAGE_KEY) as ThemeName | null;
  return stored ?? DEFAULT_THEME;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(getInitialTheme);

  function setTheme(t: ThemeName) {
    setThemeState(t);
    document.documentElement.setAttribute("data-theme", t);
    window.localStorage.setItem(STORAGE_KEY, t);
  }

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}