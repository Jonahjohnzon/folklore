import { z } from "zod";



export const createChapterSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().optional(),
  accessType: z.enum(["free", "coins", "purchase", "subscriber_only"]).optional(),
  coinsRequired: z.number().min(0).optional(),
  audioId: z.string().nullable().optional(),
  orderIndex: z.number().min(0).optional(),
  coverUrl: z.string().nullable().optional(),
});

export const updateChapterSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().optional(),
  accessType: z.enum(["free", "coins", "purchase", "subscriber_only"]).optional(),
  coinsRequired: z.number().min(0).optional(),
  audioId: z.string().nullable().optional(),
  orderIndex: z.number().min(0).optional(),
  coverUrl: z.string().nullable().optional(),
});