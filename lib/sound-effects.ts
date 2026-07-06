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
export const SOUND_OPTIONS: PlatformSound[] = [
  { id: "thunder-crack", label: "Thunder crack", category: "impact", url: "/sounds/thunder-crack.mp3", previewDurationSec: 3 },
  { id: "soft-rain", label: "Soft rain", category: "ambience", url: "/sounds/soft-rain.mp3", previewDurationSec: 6 },
  { id: "wind-howl", label: "Wind howl", category: "ambience", url: "/sounds/wind-howl.mp3", previewDurationSec: 5 },
  { id: "sword-clash", label: "Sword clash", category: "impact", url: "/sounds/sword-clash.mp3", previewDurationSec: 2 },
  { id: "heartbeat", label: "Heartbeat", category: "impact", url: "/sounds/heartbeat.mp3", previewDurationSec: 4 },
  { id: "forest-birds", label: "Forest birds", category: "nature", url: "/sounds/forest-birds.mp3", previewDurationSec: 6 },
  { id: "ocean-waves", label: "Ocean waves", category: "nature", url: "/sounds/ocean-waves.mp3", previewDurationSec: 6 },
  { id: "fireplace-crackle", label: "Fireplace crackle", category: "ambience", url: "/sounds/fireplace-crackle.mp3", previewDurationSec: 5 },
  { id: "tense-strings", label: "Tense strings sting", category: "music_sting", url: "/sounds/tense-strings.mp3", previewDurationSec: 3 },
  { id: "triumphant-horns", label: "Triumphant horns", category: "music_sting", url: "/sounds/triumphant-horns.mp3", previewDurationSec: 4 },
  { id: "page-turn", label: "Page turn", category: "impact", url: "/sounds/page-turn.mp3", previewDurationSec: 1 },
  { id: "music-box", label: "Music box", category: "music_sting", url: "/sounds/music-box.mp3", previewDurationSec: 5 },
];

export function soundUrlForId(id: string | null): string | null {
  if (!id) return null;
  return SOUND_OPTIONS.find((s) => s.id === id)?.url ?? null;
}

export function soundIdForUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  return SOUND_OPTIONS.find((s) => s.url === url)?.id ?? null;
}