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
  { id: "thunder-crack", label: "Thunder crack", category: "impact", url: "https://res.cloudinary.com/luzebox/video/upload/v1783324994/sound/thunder-crack_emigi8.mp3", previewDurationSec: 3 },
  { id: "soft-rain", label: "Soft rain", category: "ambience", url: "https://res.cloudinary.com/luzebox/video/upload/v1783324995/sound/soft-rain_gsuuhe.mp3", previewDurationSec: 6 },
  { id: "wind-howl", label: "Wind howl", category: "ambience", url: "https://res.cloudinary.com/luzebox/video/upload/v1783324995/sound/wind-howl_sp0fxi.mp3", previewDurationSec: 5 },
  { id: "sword-clash", label: "Sword clash", category: "impact", url: "https://res.cloudinary.com/luzebox/video/upload/v1783324995/sound/sword-clash_v5t06v.mp3", previewDurationSec: 2 },
  { id: "heartbeat", label: "Heartbeat", category: "impact", url: "https://res.cloudinary.com/luzebox/video/upload/v1783324995/sound/heartbeat_gu8gxr.mp3", previewDurationSec: 4 },
  { id: "forest-birds", label: "Forest birds", category: "nature", url: "https://res.cloudinary.com/luzebox/video/upload/v1783325345/sound/forest-birds_r7bsld.mp3", previewDurationSec: 6 },
  { id: "ocean-waves", label: "Ocean waves", category: "nature", url: "https://res.cloudinary.com/luzebox/video/upload/v1783324998/sound/ocean-waves_d7fraj.mp3", previewDurationSec: 6 },
  { id: "fireplace-crackle", label: "Fireplace crackle", category: "ambience", url: "https://res.cloudinary.com/luzebox/video/upload/v1783324997/sound/fireplace-crackle_awx5xd.mp3", previewDurationSec: 5 },
  { id: "tense-strings", label: "Tense strings sting", category: "music_sting", url: "https://res.cloudinary.com/luzebox/video/upload/v1783325266/sound/tense-strings_hcxgle.mp3", previewDurationSec: 3 },
  { id: "triumphant-horns", label: "Triumphant horns", category: "music_sting", url: "https://res.cloudinary.com/luzebox/video/upload/v1783325346/sound/triumphant-horns_zte4zb.mp3", previewDurationSec: 4 },
  { id: "music-box", label: "Music box", category: "music_sting", url: "https://res.cloudinary.com/luzebox/video/upload/v1783325304/sound/music-box_nfjfgf.mp3", previewDurationSec: 5 },
];

export const PAGE_SOUNDS: PlatformSound[] = [
  { id: "page-turn", label: "Page turn", category: "impact", url: "https://res.cloudinary.com/luzebox/video/upload/v1783324994/sound/page-turn_wcyxr2.mp3", previewDurationSec: 1 },
]

export const SOUND_CATEGORIES: { id: PlatformSound["category"]; label: string }[] = [
  { id: "impact", label: "Impact" },
  { id: "ambience", label: "Ambience" },
  { id: "nature", label: "Nature" },
  { id: "music_sting", label: "Music sting" },
];