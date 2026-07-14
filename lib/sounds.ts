// lib/sounds.ts
export type SoundCategory = "ambience" | "impact" | "nature" | "music_sting";

export interface PlatformSound {
  id: string;
  label: string;
  category: SoundCategory;
  url: string;
}

export const DEFAULT_PAGE_TURN_SOUND_ID = "page-turn";

// Page-turn is a fixed system sound (one-shot, not creator-selectable),
// so it stays static rather than moving into the admin-managed catalog.
export const PAGE_SOUNDS: PlatformSound[] = [
  {
    id: "page-turn",
    label: "Page turn",
    category: "impact",
    url: "https://res.cloudinary.com/luzebox/video/upload/v1784070920/sound/page-flip-6_ooqp5s.wav",
  },
];

export const SOUND_CATEGORIES: { id: SoundCategory; label: string }[] = [
  { id: "impact", label: "Impact" },
  { id: "ambience", label: "Ambience" },
  { id: "nature", label: "Nature" },
  { id: "music_sting", label: "Music sting" },
];