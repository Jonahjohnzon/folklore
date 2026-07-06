import { PLATFORM_SOUNDS } from "./sounds";
export interface SoundOption {
  id: string;
  label: string;
  /** Path under /public. */
  url: string;
}

export interface PlatformSound {
  id: string;
  label: string;
  category: "ambience" | "impact" | "nature" | "music_sting";
  url: string; // hosted asset, e.g. CDN path
  previewDurationSec: number;
}
/**
 * These are curated sounds shipped by us, not user uploads — files live in
 * /public/sounds/*. Update the id/label/url below to match whatever's
 * actually in that folder; SoundPickerModal should read from this same
 * list so its option ids line up with what gets saved on the chapter.
 */


export function soundUrlForId(id: string | null): string | null {
  if (!id) return null;
  return PLATFORM_SOUNDS.find((s) => s.id === id)?.url ?? null;
}

export function soundIdForUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  return PLATFORM_SOUNDS.find((s) => s.url === url)?.id ?? null;
}