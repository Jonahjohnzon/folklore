// Deterministic mock data generated from seeded RNGs, modeled on the
// Book / Chapter / Review / EarningsLedger / PayoutProfile / Payout schemas.
// Swap this file for real data-fetching later — component props are typed
// against the interfaces below, so consumers don't need to change.

export type BookStatus = "draft" | "ongoing" | "completed" | "hiatus" | "removed";
export type ChapterAccess = "free" | "coins" | "purchase" | "subscriber_only";
export type EarningSource = "ad_revenue" | "coin_sale" | "chapter_purchase" | "subscription";
export type PayoutMethod = "stripe" | "payoneer" | "wise";
export type TaxFormStatus = "not_submitted" | "pending" | "approved" | "rejected";
export type PayoutStatus = "pending" | "processing" | "paid" | "failed";

export interface Chapter {
  id: string;
  bookId: string;
  orderIndex: number;
  title: string;
  wordCount: number;
  accessType: ChapterAccess;
  coinsRequired: number;
  priceUsd: number;
  publishedAt: string;
  // reader engagement
  reads: number;
  avgProgressPct: number; // average scroll progress across all readers
  completionRate: number; // % of readers who hit 100%
  avgReadMinutes: number;
  // money
  earningsEstimate: number;
}

export interface Review {
  id: string;
  bookId: string;
  reader: string;
  avatarUrl: string;
  rating: 1 | 2 | 3 | 4 | 5;
  body?: string;
  helpfulVotes: number;
  unhelpfulVotes: number;
  verifiedReader: boolean;
  isPinned: boolean;
  createdAt: string;
}

export interface Book {
  id: string;
  slug: string;
  title: string;
  description: string;
  coverUrl: string;
  language: string;
  status: BookStatus;
  matureContent: boolean;
  totalReads: number;
  totalChapters: number;
  averageRating: number;
  reviewCount: number;
  publishedAt: string;
  chapters: Chapter[];
  reviews: Review[];
}

export interface EarningsEntry {
  id: string;
  bookId: string;
  bookTitle: string;
  source: EarningSource;
  grossAmount: number;
  platformFee: number;
  netAmount: number;
  isEstimated: boolean;
  createdAt: string;
}

export interface PayoutProfile {
  method: PayoutMethod;
  country: string;
  currency: string;
  taxFormStatus: TaxFormStatus;
  payoutSchedule: "monthly" | "threshold";
  minimumThreshold: number;
}

export interface Payout {
  id: string;
  amount: number;
  currency: string;
  method: PayoutMethod;
  status: PayoutStatus;
  initiatedAt: string;
  completedAt?: string;
}

// ── seeded RNG so mock data is stable across renders ───────────
function hashSeed(str: string): number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function rngFor(seed: string) {
  return mulberry32(hashSeed(seed));
}

// ── book seeds ───────────────────────────────────────────────
const BOOK_SEEDS = [
  {
    id: "b1", slug: "the-wraith-kings-bargain", title: "The Wraith King's Bargain",
    description: "A grieving necromancer strikes a deal with the king of the dead — and falls for his second-in-command.",
    status: "ongoing" as BookStatus, matureContent: true, chapterCount: 28, publishedDaysAgo: 210,
  },
  {
    id: "b2", slug: "salt-for-the-sea-witch", title: "Salt for the Sea Witch",
    description: "An exiled siren trades her voice for legs, and finds the bargain wasn't what she expected.",
    status: "ongoing" as BookStatus, matureContent: true, chapterCount: 19, publishedDaysAgo: 96,
  },
  {
    id: "b3", slug: "paper-crowns", title: "Paper Crowns",
    description: "Two rival printing-press heirs fake an engagement to save their families — and start meaning it.",
    status: "completed" as BookStatus, matureContent: false, chapterCount: 52, publishedDaysAgo: 540,
  },
  {
    id: "b4", slug: "the-last-cartographer", title: "The Last Cartographer",
    description: "The final mapmaker of a sinking continent races to chart it before it's gone for good.",
    status: "hiatus" as BookStatus, matureContent: false, chapterCount: 14, publishedDaysAgo: 320,
  },
  {
    id: "b5", slug: "moonlit-inheritance", title: "Moonlit Inheritance",
    description: "A werewolf accountant inherits a pack she never wanted, and a ledger full of old debts.",
    status: "draft" as BookStatus, matureContent: true, chapterCount: 4, publishedDaysAgo: 6,
  },
];

const REVIEWER_NAMES = [
  "Maren K.", "Jules P.", "Tobias R.", "Asha N.", "Devon L.", "Priya S.",
  "Callum W.", "Noor I.", "Theo B.", "Ines V.", "Soren H.", "Lucia M.",
  "Femi O.", "Greta J.", "Wren A.", "Kit D.",
];

const REVIEW_BODIES: Record<"high" | "mid" | "low", string[]> = {
  high: [
    "Could not put this down — the pacing in the second act is brutal in the best way.",
    "The slow burn is worth every chapter. Best update day of my week.",
    "Reread this twice already, the dialogue feels so lived-in.",
    "Genuinely surprised by how much I'm rooting for the villain at this point.",
  ],
  mid: [
    "Solid story, though a couple of chapters in the middle dragged a bit.",
    "Enjoying it overall, just wish updates came a little more often.",
    "Good worldbuilding, the romance subplot could use more room to breathe.",
  ],
  low: [
    "Started strong but lost me somewhere around the midpoint.",
    "Some pacing issues, though the premise is promising.",
  ],
};

function makeReview(bookId: string, index: number, targetRating: number, rng: () => number): Review {
  const wobble = (rng() - 0.5) * 1.6;
  const rating = Math.min(5, Math.max(1, Math.round(targetRating + wobble))) as 1 | 2 | 3 | 4 | 5;
  const tier = rating >= 5 ? "high" : rating >= 3 ? "mid" : "low";
  const pool = REVIEW_BODIES[tier];
  const hasBody = rng() < 0.72;
  return {
    id: `${bookId}-rev-${index}`,
    bookId,
    reader: REVIEWER_NAMES[Math.floor(rng() * REVIEWER_NAMES.length)],
    avatarUrl: `https://i.pravatar.cc/100?img=${Math.floor(rng() * 70)}`,
    rating,
    body: hasBody ? pool[Math.floor(rng() * pool.length)] : undefined,
    helpfulVotes: Math.floor(rng() * 140),
    unhelpfulVotes: Math.floor(rng() * 8),
    verifiedReader: rng() < 0.82,
    isPinned: false,
    createdAt: new Date(Date.now() - Math.floor(rng() * 120) * 86_400_000).toISOString(),
  };
}

function makeChapters(seed: (typeof BOOK_SEEDS)[number], rng: () => number): Chapter[] {
  const retention = 0.9 + rng() * 0.05; // per-chapter reader retention
  const baseReads =
    (4000 + Math.floor(rng() * 60000)) *
    (seed.status === "completed" ? 1.4 : seed.status === "draft" ? 0.02 : 1);

  const chapters: Chapter[] = [];
  for (let i = 0; i < seed.chapterCount; i++) {
    const reads = Math.max(20, Math.round(baseReads * Math.pow(retention, i)));
    const wordCount = 1800 + Math.floor(rng() * 2400);
    const avgProgressPct = Math.max(35, Math.round(92 - i * 0.4 - rng() * 8));
    const completionRate = Math.max(20, Math.round(avgProgressPct - rng() * 12));
    const avgReadMinutes = Math.max(4, Math.round(wordCount / 220));

    let accessType: ChapterAccess = "free";
    if (i >= 3) {
      const roll = rng();
      accessType =
        seed.status === "completed"
          ? roll < 0.55 ? "purchase" : roll < 0.85 ? "free" : "subscriber_only"
          : roll < 0.5 ? "coins" : roll < 0.85 ? "free" : "subscriber_only";
    }
    const coinsRequired = accessType === "coins" ? 5 + Math.floor(rng() * 4) * 5 : 0;
    const priceUsd = accessType === "purchase" ? 0.99 : 0;

    let earningsEstimate = 0;
    if (accessType === "free") earningsEstimate = reads * 0.0019;
    else if (accessType === "coins") earningsEstimate = reads * 0.16 * coinsRequired * 0.011;
    else if (accessType === "purchase") earningsEstimate = reads * 0.08 * priceUsd;
    else if (accessType === "subscriber_only") earningsEstimate = reads * 0.045;

    chapters.push({
      id: `${seed.id}-ch-${i + 1}`,
      bookId: seed.id,
      orderIndex: i + 1,
      title: `Chapter ${i + 1}`,
      wordCount,
      accessType,
      coinsRequired,
      priceUsd,
      publishedAt: new Date(Date.now() - (seed.chapterCount - i) * 6 * 86_400_000).toISOString(),
      reads,
      avgProgressPct,
      completionRate,
      avgReadMinutes,
      earningsEstimate: Math.round(earningsEstimate * 100) / 100,
    });
  }
  return chapters;
}

export const books: Book[] = BOOK_SEEDS.map((seed) => {
  const rng = rngFor(seed.id);
  const chapters = makeChapters(seed, rng);
  const targetRating = 3.6 + rng() * 1.3;
  const reviewCount = seed.status === "draft" ? 0 : 5 + Math.floor(rng() * 9);
  const reviews = Array.from({ length: reviewCount }, (_, i) =>
    makeReview(seed.id, i, targetRating, rng)
  );
  if (reviews.length) {
    reviews.sort((a, b) => b.helpfulVotes - a.helpfulVotes);
    reviews[0].isPinned = true;
  }
  const averageRating = reviews.length
    ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
    : 0;

  return {
    id: seed.id,
    slug: seed.slug,
    title: seed.title,
    description: seed.description,
    coverUrl: `https://picsum.photos/seed/${seed.slug}/240/360`,
    language: "en",
    status: seed.status,
    matureContent: seed.matureContent,
    totalReads: chapters[0]?.reads ?? 0,
    totalChapters: chapters.length,
    averageRating,
    reviewCount: reviews.length,
    publishedAt: new Date(Date.now() - seed.publishedDaysAgo * 86_400_000).toISOString(),
    chapters,
    reviews,
  };
});

export function getBookById(id: string) {
  return books.find((b) => b.id === id);
}

// ── earnings ledger (last 30 days, across all books) ───────────
const SOURCES: EarningSource[] = ["ad_revenue", "coin_sale", "chapter_purchase", "subscription"];
const PLATFORM_FEE_RATE = 0.3;

export const earningsLedger: EarningsEntry[] = books.flatMap((book) => {
  if (book.status === "draft") return [];
  const rng = rngFor(`${book.id}-ledger`);
  const entries: EarningsEntry[] = [];
  for (let day = 29; day >= 0; day--) {
    SOURCES.forEach((source) => {
      if (rng() < 0.35) return; // not every source active every day
      const base =
        source === "ad_revenue" ? 1 + rng() * 6 :
        source === "coin_sale" ? 0.5 + rng() * 9 :
        source === "chapter_purchase" ? 0.3 + rng() * 5 :
        0.8 + rng() * 7;
      const grossAmount = Math.round(base * 100) / 100;
      const platformFee = Math.round(grossAmount * PLATFORM_FEE_RATE * 100) / 100;
      entries.push({
        id: `${book.id}-${source}-d${day}`,
        bookId: book.id,
        bookTitle: book.title,
        source,
        grossAmount,
        platformFee,
        netAmount: Math.round((grossAmount - platformFee) * 100) / 100,
        isEstimated: source === "ad_revenue" && day <= 2, // pending the monthly Google report
        createdAt: new Date(Date.now() - day * 86_400_000).toISOString(),
      });
    });
  }
  return entries;
});

export const payoutProfile: PayoutProfile = {
  method: "stripe",
  country: "US",
  currency: "USD",
  taxFormStatus: "approved",
  payoutSchedule: "monthly",
  minimumThreshold: 10,
};

export const payoutHistory: Payout[] = [
  { id: "p1", amount: 1042.18, currency: "USD", method: "stripe", status: "paid", initiatedAt: new Date(Date.now() - 60 * 86_400_000).toISOString(), completedAt: new Date(Date.now() - 58 * 86_400_000).toISOString() },
  { id: "p2", amount: 1180.62, currency: "USD", method: "stripe", status: "paid", initiatedAt: new Date(Date.now() - 30 * 86_400_000).toISOString(), completedAt: new Date(Date.now() - 28 * 86_400_000).toISOString() },
  { id: "p3", amount: 1284.5, currency: "USD", method: "stripe", status: "processing", initiatedAt: new Date(Date.now() - 1 * 86_400_000).toISOString() },
];

// ── helpers ──────────────────────────────────────────────────
export function estimateNextPayout(entries: EarningsEntry[], profile: PayoutProfile) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const amountDue = entries
    .filter((e) => new Date(e.createdAt) >= monthStart)
    .reduce((sum, e) => sum + e.netAmount, 0);
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return {
    amountDue: Math.round(amountDue * 100) / 100,
    isAboveThreshold: amountDue >= profile.minimumThreshold,
    nextPayoutDate: nextMonth.toLocaleDateString("en-US", { month: "long", day: "numeric" }),
  };
}

export function getDailyTotals(entries: EarningsEntry[], days: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const buckets = Array(days).fill(0) as number[];
  entries.forEach((e) => {
    const d = new Date(e.createdAt);
    d.setHours(0, 0, 0, 0);
    const diffDays = Math.round((today.getTime() - d.getTime()) / 86_400_000);
    const idx = days - 1 - diffDays;
    if (idx >= 0 && idx < days) buckets[idx] += e.netAmount;
  });
  return buckets.map((v) => Math.round(v * 100) / 100);
}