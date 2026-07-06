// lib/sounds.ts
// Platform-provided sound library. Creators pick from this list only —
// they cannot upload their own audio, so every chapter sound is licensed/hosted by us.

export interface PlatformSound {
  id: string;
  label: string;
  category: "ambience" | "impact" | "nature" | "music_sting";
  url: string; // hosted asset, e.g. CDN path
  previewDurationSec: number;
}

export const DEFAULT_PAGE_TURN_SOUND_ID = "page-turn";

export const PLATFORM_SOUNDS: PlatformSound[] = [
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

export const SOUND_CATEGORIES: { id: PlatformSound["category"]; label: string }[] = [
  { id: "impact", label: "Impact" },
  { id: "ambience", label: "Ambience" },
  { id: "nature", label: "Nature" },
  { id: "music_sting", label: "Music sting" },
];