"use client";

export type ReaderAppearanceMode = "author" | "custom";

export interface ReaderPrefs {
  mode: ReaderAppearanceMode;
  fontId: string;
  fontSize: number;
  themeId: string;
  soundOn: boolean;
  pageTurnSoundId: string | null;
  ambientSoundId: string | null;
}

const STORAGE_KEY = "lore:reader-prefs";

export function loadReaderPrefs(): ReaderPrefs | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ReaderPrefs) : null;
  } catch {
    return null;
  }
}

export function saveReaderPrefs(prefs: ReaderPrefs) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}