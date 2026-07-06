import { z } from "zod";

export const soundEffectSchema = z.object({
  trigger: z.enum(["scroll_pct", "paragraph_id"]),
  value: z.number(),
  url: z.string().url(),
  volume: z.number().min(0).max(1).optional(),
});

export const createChapterSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().optional(),
  accessType: z.enum(["free", "coins", "purchase", "subscriber_only"]).optional(),
  coinsRequired: z.number().min(0).optional(),
  audioIntroUrl: z.string().nullable().optional(),
  soundEffects: z.array(soundEffectSchema).max(50).optional(),
  orderIndex: z.number().min(0).optional(),
  coverUrl: z.string().nullable().optional(),
});

export const updateChapterSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().optional(),
  accessType: z.enum(["free", "coins", "purchase", "subscriber_only"]).optional(),
  coinsRequired: z.number().min(0).optional(),
  audioIntroUrl: z.string().nullable().optional(),
  soundEffects: z.array(soundEffectSchema).max(50).optional(),
  orderIndex: z.number().min(0).optional(),
  coverUrl: z.string().nullable().optional(),
});