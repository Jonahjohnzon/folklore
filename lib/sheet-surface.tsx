// lib/sheet-surface.ts
//
// Single source of truth for how a "sheet" is rendered — the paper surface
// shared by the chapter editor canvas and the reader page. Keeping the
// padding scale, elevation, and texture blending here means a design
// change only has to be made once and both surfaces stay in lockstep.

import type { CSSProperties } from "react";

export interface SheetSurfaceTheme {
  background: string;
  textColor: string;
  borderColor: string;
  textureUrl?: string | null;
}

// Custom tailwind scale (1 unit = 0.25rem) — matches the existing
// min-h-275 / max-w-210 pattern already used on the editor canvas.
export const SHEET_MAX_WIDTH = "max-w-225"; // ~940px
export const SHEET_PADDING = "p-10 sm:p-16 lg:p-20";
export const SHEET_RADIUS = "rounded-sm";

export function getSheetSurfaceStyle(theme: SheetSurfaceTheme): CSSProperties {
return {
  backgroundColor: theme.background,
  color: theme.textColor,
  borderColor: theme.borderColor,

  backgroundImage: theme.textureUrl
    ? `url(${theme.textureUrl})`
    : undefined,

  backgroundRepeat: "repeat",
  backgroundPosition: "center",
  backgroundBlendMode: theme.textureUrl ? "multiply" : undefined,

  boxShadow:
    `inset 0 0 0 1px color-mix(in srgb, ${theme.borderColor} 55%, transparent), ` +
    `0 34px 64px -30px rgba(0,0,0,0.32), ` +
    `0 10px 26px -14px rgba(0,0,0,0.18)`,
};
}

// A quiet chapter-opening rule — a single hairline, no ornament. Used at
// the top of the sheet's content area on both the editor and the reader.
export function SheetOpeningRule({ color }: { color: string }) {
 return (
    <div aria-hidden className="mx-auto mb-9 h-px w-14 opacity-[0.18]" style={{ background: color }}></div>
  );
}

 