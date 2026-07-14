/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { Book } from "@/app/api/lib/models/Book";
import { Tag } from "@/app/api/lib/models/Tag";
import { ok, fail } from "@/app/api/response";
import { NotFoundError, ValidationError } from "@/app/api/lib/db/errors";

const SORT_OPTIONS = ["popular", "newest", "rating", "updated", "trending"] as const;
const STATUS_FILTERS = ["all", "ongoing", "completed", "hiatus"] as const;

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(24),
  sort: z.enum(SORT_OPTIONS).default("popular"),
  status: z.enum(STATUS_FILTERS).default("all"),
  mature: z.enum(["include", "exclude"]).default("include"),
});

// Statuses visible to readers at all — drafts and removed books never show up in browse,
// regardless of the status filter applied on top.
const VISIBLE_STATUSES = ["ongoing", "completed", "hiatus"];

const SORT_MAP: Record<(typeof SORT_OPTIONS)[number], Record<string, 1 | -1>> = {
  popular: { totalReads: -1, updatedAt: -1 },
  newest: { publishedAt: -1, createdAt: -1 },
  rating: { averageRating: -1, reviewCount: -1 },
  updated: { updatedAt: -1 },
  // Pure totalReads ranking — no tiebreaker on updatedAt like "popular" has,
  // so this is strictly "most-read right now" rather than "popular AND fresh."
  trending: { totalReads: -1 },
};

// Virtual genres: slugs that don't correspond to a real Tag document, but map
// to a canned query instead.
// "new"       = latest published books, no tag filter.
// "trending"  = top books by totalReads, no tag filter.
// "completed" = latest finished books, no tag filter, status forced to "completed".
const VIRTUAL_TAGS: Record<
  string,
  { name: string; sort: (typeof SORT_OPTIONS)[number]; forceStatus?: (typeof STATUS_FILTERS)[number] }
> = {
  new: { name: "New Releases", sort: "newest" },
  trending: { name: "Trending", sort: "trending" },
  completed: { name: "Completed", sort: "newest", forceStatus: "completed" },
};

// Public route: browsing by genre doesn't require a signed-in user.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tag: string }> }
) {
  try {
    await connectToDatabase();
    const { tag } = await params;
    const tagSlug = tag.toLowerCase();

    const parsed = querySchema.safeParse(Object.fromEntries(req.nextUrl.searchParams));
    if (!parsed.success) {
      throw new ValidationError("Invalid query params", parsed.error.flatten().fieldErrors);
    }
    const { page, limit, mature } = parsed.data;

    const virtual = VIRTUAL_TAGS[tagSlug];
    // Virtual tags force their own sort (e.g. "new" always sorts newest-first,
    // "trending" always sorts by totalReads), ignoring whatever ?sort= was passed.
    const sort = virtual ? virtual.sort : parsed.data.sort;
    // Some virtual tags (e.g. "completed") also force the status filter,
    // ignoring whatever ?status= was passed.
    const status = virtual?.forceStatus ?? parsed.data.status;

    let tagData: { _id: unknown; name: string; slug: string } | null = null;
    if (!virtual) {
      tagData = await Tag.findOne({ slug: tagSlug }).lean();
      if (!tagData) throw new NotFoundError("Genre not found");
    }

    const filter: Record<string, unknown> = {
      status: status === "all" ? { $in: VISIBLE_STATUSES } : status,
    };
    if (tagData) filter.tags = tagData._id;
    if (mature === "exclude") filter.matureContent = false;

    const [books, total] = await Promise.all([
      Book.find(filter)
        .populate({ path: "authorId", select: "penName" })
        .sort(SORT_MAP[sort])
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Book.countDocuments(filter),
    ]);

    const items = books.map((b: any) => ({
      _id: String(b._id),
      slug: b.slug,
      title: b.title,
      coverUrl: b.coverUrl ?? null,
      matureContent: b.matureContent,
      totalReads: b.totalReads,
      averageRating: b.averageRating,
      publishedAt: b.publishedAt ?? null,
      author: { penName: b.authorId?.penName ?? "Unknown" },
    }));

    return ok({
      tag: virtual
        ? { name: virtual.name, slug: tagSlug }
        : { name: tagData!.name, slug: tagData!.slug },
      books: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
      filters: { sort, status, mature },
    });
  } catch (error) {
    return fail(error);
  }
}