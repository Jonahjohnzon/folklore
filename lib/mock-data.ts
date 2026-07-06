import type { Author, Book, Chapter, Review, Tag, ParagraphCommentMock } from "./types";
import { DEFAULT_SHEET_THEME_ID } from "@/lib/sheet-themes";

const authors: Author[] = [
  { id: "a1", penName: "Wren Ashbourne", avatarUrl: "https://i.pravatar.cc/100?img=12", followers: 18400 },
  { id: "a2", penName: "Mira Castellan", avatarUrl: "https://i.pravatar.cc/100?img=32", followers: 9100 },
  { id: "a3", penName: "Soren Vale", avatarUrl: "https://i.pravatar.cc/100?img=51", followers: 42300 },
  { id: "a4", penName: "Lila Knox", avatarUrl: "https://i.pravatar.cc/100?img=5", followers: 6700 },
];

const tag = (id: string, name: string, category: Tag["category"] = "genre"): Tag => ({
  id,
  name,
  slug: name.toLowerCase().replace(/\s+/g, "-"),
  category,
});




// ── Chapters ─────────────────────────────────────────────────
// Normalized: chapters live in their own flat array keyed by bookId, not
// embedded on Book. Every book below gets a small chapter set generated
// from the same template content so every book/chapter page has something
// real to render — swap CONTENT per-book later if you want distinct text.

const TITLES = [
  "The Forge Goes Cold",
  "Ash on the Threshold",
  "A Crown of Coal",
  "What the Embers Remember",
  "The Court Convenes",
  "Smoke Without Fire",
];

const CONTENT = `The forge had not spoken in three days, and Wren knew, the way she knew the weight of a hammer before she lifted it, that something in the world had shifted.

She pressed her palm to the cold stone and waited for the old warmth, the low hum the dragon-bound fires used to keep even in sleep. Nothing answered.

"It's never gone quiet before," she said, mostly to herself, mostly to the empty workshop.

Her father's apprentice, Cael, stood in the doorway with the look of a man who had already guessed the worst and was waiting for permission to say it aloud. "Maybe it isn't gone," he offered. "Maybe it's listening."

Wren didn't answer. Outside, the embers of the Last Court flickered once, twice, and went still.`;

// Per-chapter presentation, as if each had been configured by the author in
// ChapterSidebar: which entrance sound plays once when the chapter opens,
// which page-turn sound plays on next/previous, which sheet theme is used,
// and which of those the author has locked so readers can't override them.
const PRESENTATIONS: {
  soundId: string | null;
  pageTurnSoundId: string | null;
  sheetThemeId: string;
  locks: { theme: boolean; font: boolean; sound: boolean };
}[] = [
  { soundId: null,               pageTurnSoundId: "page-turn", sheetThemeId: DEFAULT_SHEET_THEME_ID, locks: { theme: false, font: false, sound: false } },
  { soundId: "soft-rain",        pageTurnSoundId: "page-turn", sheetThemeId: DEFAULT_SHEET_THEME_ID, locks: { theme: false, font: false, sound: false } },
  // Chapter 3 is the paid/coins chapter — author locks the thunder-crack
  // sting so it always lands as the dramatic beat it's written for.
  { soundId: "thunder-crack",    pageTurnSoundId: null,        sheetThemeId: DEFAULT_SHEET_THEME_ID, locks: { theme: false, font: false, sound: true } },
  { soundId: "heartbeat",        pageTurnSoundId: "page-turn", sheetThemeId: DEFAULT_SHEET_THEME_ID, locks: { theme: false, font: false, sound: false } },
  { soundId: "tense-strings",    pageTurnSoundId: "page-turn", sheetThemeId: DEFAULT_SHEET_THEME_ID, locks: { theme: true,  font: false, sound: false } },
  { soundId: "triumphant-horns", pageTurnSoundId: "music-box", sheetThemeId: DEFAULT_SHEET_THEME_ID, locks: { theme: false, font: false, sound: false } },
];

function makeChaptersForBook(bookId: string, count: number): Chapter[] {
  return Array.from({ length: count }).map((_, i) => {
    const p = PRESENTATIONS[i % PRESENTATIONS.length];
    return {
      id: `${bookId}-c${i + 1}`,
      bookId,
      orderIndex: i + 1,
      title: TITLES[i % TITLES.length],
      content: CONTENT,
      wordCount: 1240,
      accessType: i < 2 ? "free" : i === 2 ? "coins" : "free",
      coinsRequired: i === 2 ? 20 : 0,
      publishedAt: "2026-04-10",
      presentation: {
        sheetThemeId: p.sheetThemeId,
        soundId: p.soundId,
        pageTurnSoundId: p.pageTurnSoundId,
        fontId: "serif",
        fontSize: 18,
        locks: p.locks,
      },
    };
  });
}





export const coinBalance = 1240;

