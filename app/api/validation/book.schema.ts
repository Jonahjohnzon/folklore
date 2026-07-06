import { z } from "zod";

export const createBookSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  language: z.string().min(2).max(10).optional(),
  status: z.enum(["draft", "ongoing", "completed", "hiatus", "removed"]).optional(),
  matureContent: z.boolean().optional(),
  // Tag ObjectIds — wire up once tag creation/lookup exists on the client.
   // Genre/tag labels (e.g. "Fantasy"). Resolved to Tag ObjectIds server-side
  // in POST /api/books via resolveTagIds() — see app/api/lib/tags.ts.
  tags: z.array(z.string()).max(10).optional(),
  // Set after a signed client-side Cloudinary upload — see uploads/sign/route.ts.
  coverUrl: z.string().url().optional(),
});

export const updateBookSchema = createBookSchema.partial();

const hexColor = z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a hex color like #8B5CF6");

export const updateBookThemeSchema = z.object({
  fontFamily: z.string().max(60).optional(),
  fontSizeBase: z.number().min(10).max(32).optional(),
  lineHeight: z.number().min(1).max(3).optional(),
  textureUrl: z.string().nullable().optional(),
  bgColor: hexColor.optional(),
  textColor: hexColor.optional(),
  accentColor: hexColor.optional(),
  linkColor: hexColor.optional(),
  bgMusicUrl: z.string().url().nullable().optional(),
  bgMusicVolume: z.number().min(0).max(1).optional(),
  customCss: z.string().max(5000).optional(),
  sheetThemeId: z.string().max(100).optional(),
  locks: z.object({
    theme: z.boolean().optional(),  
    font: z.boolean().optional(),
    sound: z.boolean().optional(),
  }).optional()
});