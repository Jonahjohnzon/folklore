export interface WorkSummary {
  id: string;
  title: string;
  slug: string;
  genre: string;
  status: "ongoing" | "completed" | "hiatus";
  reads: number;
  likes: number;
  chapters: number;
  /** Drives the generated cover's gradient — keeps covers deterministic and asset-free. */
  paletteId: "arcane" | "ember" | "bloodmoon" | "wildwood" | "gilded";
}

const PALETTES: Record<WorkSummary["paletteId"], { from: string; to: string; ink: string }> = {
  arcane: { from: "#2b1a4d", to: "#0f0a24", ink: "#e7defb" },
  ember: { from: "#5c1f14", to: "#1c0906", ink: "#ffe4d6" },
  bloodmoon: { from: "#3a0f24", to: "#12030d", ink: "#ffd6ea" },
  wildwood: { from: "#12321f", to: "#04120a", ink: "#d9f7e3" },
  gilded: { from: "#4a3612", to: "#1a1204", ink: "#f7e7c1" },
};

export function paletteFor(id: WorkSummary["paletteId"]) {
  return PALETTES[id];
}

const MOCK_WORKS: WorkSummary[] = [
  {
    id: "w1",
    title: "The Hollow Crown",
    slug: "the-hollow-crown",
    genre: "Epic Fantasy",
    status: "ongoing",
    reads: 128_400,
    likes: 9_800,
    chapters: 42,
    paletteId: "arcane",
  },
  {
    id: "w2",
    title: "Ashes of the Ember Court",
    slug: "ashes-of-the-ember-court",
    genre: "Romantasy",
    status: "ongoing",
    reads: 84_200,
    likes: 12_100,
    chapters: 31,
    paletteId: "ember",
  },
  {
    id: "w3",
    title: "A Pact Written in Blood",
    slug: "a-pact-written-in-blood",
    genre: "Dark Fantasy",
    status: "completed",
    reads: 211_900,
    likes: 18_450,
    chapters: 58,
    paletteId: "bloodmoon",
  },
  {
    id: "w4",
    title: "The Last Warden of Wyldmere",
    slug: "the-last-warden-of-wyldmere",
    genre: "Sword & Sorcery",
    status: "hiatus",
    reads: 45_600,
    likes: 3_920,
    chapters: 19,
    paletteId: "wildwood",
  },
  {
    id: "w5",
    title: "Godsbane",
    slug: "godsbane",
    genre: "Mythic Fantasy",
    status: "ongoing",
    reads: 67_300,
    likes: 5_610,
    chapters: 24,
    paletteId: "gilded",
  },
];

/**
 * TODO: replace with a real call once GET /users/:username/works exists.
 * Returns the same mock set regardless of username for now.
 */
export function getWorksForUser(_username: string): WorkSummary[] {
  return MOCK_WORKS;
}