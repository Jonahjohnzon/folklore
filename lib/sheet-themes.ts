// lib/sheet-themes.ts


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
  },
  {
    id: "aged",
    label: "Aged paper",
    background: "#E9DCC0",
    textColor: "#2E2113",
    borderColor: "#C7AE7E",
  },
  {
    id: "rice",
    label: "Rice paper",
    background: "#F3F0E7",
    textColor: "#2B2820",
    borderColor: "#DAD5C4",
  },
  {
    id: "midnight-ink",
    label: "Midnight",
    background: "#15171C",
    textColor: "#E7E5DE",
    borderColor: "#2B2E36",
  },
  {
    id: "wool",
    label: "Wool",
    background: "#F6F3EC",
    textColor: "#262421",
    borderColor: "#DCD6C6",
  },
];

export const DEFAULT_SHEET_THEME_ID = "white";