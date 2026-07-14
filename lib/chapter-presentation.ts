import type { PublicChapterTheme } from "@/app/services/ChapterService";

export type CreatorLocks = { theme: boolean; font: boolean; sound: boolean };

export interface ChapterPresentation {
  accentColor: string;
  background: string;
  textColor: string;
  borderColor: string;
  textureUrl: string | null;
  fontId: string;
  fontFamily: string;
  fontSize: number;
  fontSizeBase: number;
  lineHeight: number;
  bgMusicUrl: string | null;
  bgMusicVolume: number;
  customCss: string | null;
  // Left in for future use — BookTheme has no per-field lock flags today,
  // so these are always false, meaning reader prefs can always override.
  locks: CreatorLocks
}

const FONT_FAMILY_TO_ID: Record<string, string> = {
  Georgia: "serif",
  "Source Serif": "serif",
  Fraunces: "display",
  Inter: "sans",
  "Plex Mono": "mono",
};

// The route always returns a theme object now (BookTheme doc, or the
// schema's own defaults if none exists) — no null-handling needed here.
export function getChapterPresentation(theme: PublicChapterTheme|null): ChapterPresentation {
  if (!theme) {
    return {
      accentColor: "#000000",
      background: "#ffffff",
      textColor: "#000000",
      borderColor: "#cccccc",
      textureUrl: null,
      fontId: "serif",
      fontFamily: "Georgia",
      fontSize: 18,
      fontSizeBase: 18,
      lineHeight: 1.5,
      bgMusicUrl: null,
      bgMusicVolume: 50,
      customCss: null,
      locks: { theme: false, font: false, sound: false },
    };
  }
  return {
    accentColor: theme.accentColor,
    background: theme.bgColor,
    textColor: theme.textColor,
    borderColor: theme.linkColor,
    textureUrl: null,
    fontId: FONT_FAMILY_TO_ID[theme.fontFamily] ?? "serif",
    fontFamily: theme.fontFamily,
    fontSize: theme.fontSizeBase,
    fontSizeBase: theme.fontSizeBase,
    lineHeight: theme.lineHeight,
    bgMusicUrl: theme.bgMusicUrl,
    bgMusicVolume: theme.bgMusicVolume,
    customCss: theme.customCss,
    locks: { theme: false, font: false, sound: false },
  };
}