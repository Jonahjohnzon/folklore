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

export const updateUserSchema = z.object({
  displayName: z.string().trim().min(2).max(40).optional(),
  bio: z.string().trim().max(280).optional(),
  avatarUrl: z.string().url().nullable().optional(),
  matureContentEnabled: z.boolean().optional(),
  preferences: z.record(z.string(), z.unknown()).optional(),
  avatarPublicId:z.string().nullable().optional(),
  websiteUrl:z.string().url().nullable().optional(),
});
export type UpdateUserInput = z.infer<typeof updateUserSchema>;


