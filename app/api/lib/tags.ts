import { Tag } from "@/app/api/lib/models/Tag";
import type { Types } from "mongoose";

function slugifyTag(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

/**
 * Turns a list of genre/tag labels (e.g. ["Fantasy", "Sci-Fi"]) into Tag
 * ObjectIds, creating any Tag docs that don't exist yet. Case-insensitive
 * on name, so "sci-fi" and "Sci-Fi" resolve to the same Tag.
 *
 * Uses findOneAndUpdate + upsert per label (atomic per-doc) rather than
 * insertMany, so two requests racing to create the same new tag don't
 * throw on the unique index — the second one just matches the first's
 * upsert and increments usageCount instead.
 */
export async function resolveTagIds(labels: string[]): Promise<Types.ObjectId[]> {
  const seen = new Set<string>();
  const unique = labels
    .map((l) => l.trim())
    .filter((l) => {
      if (!l || seen.has(l.toLowerCase())) return false;
      seen.add(l.toLowerCase());
      return true;
    });

  const tags = await Promise.all(
    unique.map((name) =>
      Tag.findOneAndUpdate(
        { slug: slugifyTag(name) },
        {
          $setOnInsert: { name, slug: slugifyTag(name), category: "genre" },
          $inc: { usageCount: 1 },
        },
        { upsert: true, new: true }
      )
    )
  );

  return tags.map((t) => t._id);
}