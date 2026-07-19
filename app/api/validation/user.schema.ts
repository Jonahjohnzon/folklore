import { z } from "zod";

export const creatorApplySchema = z.object({
  penName: z
    .string()
    .trim()
    .min(2, "Pen name must be at least 2 characters")
    .max(40, "Pen name must be under 40 characters"),
  bio: z.string().trim().max(280, "Bio must be under 280 characters").optional(),
});
export type CreatorApplyInput = z.infer<typeof creatorApplySchema>;

// Treats "" the same as omitted/null — matches how a cleared form input actually
// behaves. Applied to both URL fields since avatarUrl has the same shape.
const optionalUrl = z
  .string()
  .trim()
  .transform((val) => (val === "" ? null : val))
  .pipe(z.string().url().nullable())
  .nullable()
  .optional();

export const updateUserSchema = z.object({
  displayName: z.string().trim().min(2).max(40).optional(),
  bio: z.string().trim().max(280).optional(),
  avatarUrl: optionalUrl,
  matureContentEnabled: z.boolean().optional(),
  preferences: z.record(z.string(), z.unknown()).optional(),
  avatarPublicId: z.string().nullable().optional(),
  websiteUrl: optionalUrl,
});
export type UpdateUserInput = z.infer<typeof updateUserSchema>;