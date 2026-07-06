// lib/badges/definitions.ts
export const BADGE_DEFS = [
  { key: "reading_10", category: "reading_milestone", tier: 1, name: "Novice reader", threshold: 10 },
  { key: "reading_50", category: "reading_milestone", tier: 2, name: "Dedicated reader", threshold: 50 },
  { key: "reading_200", category: "reading_milestone", tier: 3, name: "Avid reader", threshold: 200 },
  { key: "reading_500", category: "reading_milestone", tier: 4, name: "Bookworm", threshold: 500 },
  { key: "reading_1500", category: "reading_milestone", tier: 5, name: "Legendary reader", threshold: 1500 },
  { key: "streak_3", category: "streak", tier: 1, name: "Spark", threshold: 3 },
  { key: "streak_7", category: "streak", tier: 2, name: "Ember", threshold: 7 },
  { key: "streak_30", category: "streak", tier: 3, name: "Blaze", threshold: 30 },
  { key: "streak_100", category: "streak", tier: 4, name: "Wildfire", threshold: 100 },
  { key: "streak_365", category: "streak", tier: 5, name: "Eternal flame", threshold: 365 },
] as const;