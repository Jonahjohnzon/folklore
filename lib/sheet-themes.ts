// lib/sheet-themes.ts
// Visual "paper" presets for the editor sheet and reader background.
// Distinct from BookTheme (colors/fonts) — this is specifically the page texture.
//
// Texture files are from transparenttextures.com (CC-BY-3.0, attribution required).
// Self-hosted under /public/textures/ rather than hotlinked — the source site's
// own maintainer has flagged it as partially broken/at risk of shutting down.
// Attribution: textures by Subtle Patterns / transparenttextures.com contributors.

export interface SheetTheme {
  id: string;
  label: string;
  background: string;
  textColor: string;
  borderColor: string;
  textureUrl?: string;
}

export const SHEET_THEMES: SheetTheme[] = [
  {
    id: "white",
    label: "Plain white",
    background: "#FFFFFF",
    textColor: "#1A1A1A",
    borderColor: "#E5E2DA",
  },
  {
    id: "parchment",
    label: "Parchment",
    background: "#F2E8D5",
    textColor: "#3A2E1F",
    borderColor: "#D8C7A0",
    textureUrl: "/textures/beige-paper.png",
  },
  {
    id: "aged",
    label: "Aged paper",
    background: "#E9DCC0",
    textColor: "#2E2113",
    borderColor: "#C7AE7E",
    textureUrl: "/textures/sandpaper.png",
  },
  {
    id: "rice",
    label: "Rice paper",
    background: "#F3F0E7",
    textColor: "#2B2820",
    borderColor: "#DAD5C4",
    textureUrl: "/textures/rice-paper-2.png",
  },
  {
    id: "midnight-ink",
    label: "Midnight",
    background: "#15171C",
    textColor: "#E7E5DE",
    borderColor: "#2B2E36",
    textureUrl: "/textures/black-paper.png",
  },
  {
    id: "wool",
    label: "Wool",
    background: "#F6F3EC",
    textColor: "#262421",
    borderColor: "#DCD6C6",
    textureUrl: "/textures/light-wool.png",
  },
];

export const DEFAULT_SHEET_THEME_ID = "white";