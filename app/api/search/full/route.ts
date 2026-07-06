/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/search/full/route.ts
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { Book } from "@/app/api/lib/models/Book";
import { User } from "@/app/api/lib/models/User";
import { Tag } from "@/app/api/lib/models/Tag";
import { ok, fail } from "@/app/api/response";
import { optionalAuth } from "@/app/api/auth/optionalAuth";

const VISIBLE_STATUSES = ["ongoing", "completed", "hiatus"];
const PAGE_SIZE = 20;
const ALL_TAB_PREVIEW = 6;

type SearchTab = "all" | "books" | "authors" | "tags";

function escapeRegex(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parsePage(v: string | null) {
  const n = Number(v);
  return Number.isInteger(n) && n > 0 ? n : 1;
}

function emptySection() {
  return { items: [] as unknown[], total: 0 };
}

export const GET = optionalAuth(async (req) => {
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get("q")?.trim() ?? "";
    const tab = (url.searchParams.get("type") as SearchTab) ?? "all";
    const page = parsePage(url.searchParams.get("page"));

    if (q.length < 2) {
      return ok({ query: q, tab, page, pageSize: PAGE_SIZE, books: emptySection(), authors: emptySection(), tags: emptySection() });
    }

    await connectToDatabase();

    const wantBooks = tab === "all" || tab === "books";
    const wantAuthors = tab === "all" || tab === "authors";
    const wantTags = tab === "all" || tab === "tags";

    const booksLimit = tab === "books" ? PAGE_SIZE : ALL_TAB_PREVIEW;
    const authorsLimit = tab === "authors" ? PAGE_SIZE : ALL_TAB_PREVIEW;
    const tagsLimit = tab === "tags" ? PAGE_SIZE : ALL_TAB_PREVIEW;
    const booksSkip = tab === "books" ? (page - 1) * PAGE_SIZE : 0;
    const authorsSkip = tab === "authors" ? (page - 1) * PAGE_SIZE : 0;
    const tagsSkip = tab === "tags" ? (page - 1) * PAGE_SIZE : 0;

    const [books, authors, tags] = await Promise.all([
      wantBooks ? searchBooks(q, booksSkip, booksLimit) : emptySection(),
      wantAuthors ? searchAuthors(q, authorsSkip, authorsLimit) : emptySection(),
      wantTags ? searchTags(q, tagsSkip, tagsLimit) : emptySection(),
    ]);

    return ok({ query: q, tab, page, pageSize: PAGE_SIZE, books, authors, tags });
  } catch (error) {
    return fail(error);
  }
});

// replaces searchBooks in app/api/search/full/route.ts



async function searchBooks(q: string, skip: number, limit: number) {
  const pattern = new RegExp(escapeRegex(q), "i");
  const filter = {
    status: { $in: VISIBLE_STATUSES },
    $or: [{ title: pattern }, { description: pattern }],
  };

  const [items, total] = await Promise.all([
    Book.find(filter)
      .select("title slug coverUrl authorId description totalReads")
      .sort({ totalReads: -1 }) // no textScore available anymore — fall back to popularity
      .skip(skip)
      .limit(limit)
      .populate("authorId", "penName username")
      .lean(),
    Book.countDocuments(filter),
  ]);

  return {
    total,
    items: items.map((b: any) => {
      const author = b.authorId as { penName?: string; username: string } | null;
      return {
        _id: String(b._id),
        title: b.title,
        slug: b.slug,
        coverUrl: b.coverUrl ?? null,
        description: b.description ?? null,
        authorName: author?.penName ?? author?.username ?? "Unknown",
      };
    }),
  };
}

async function searchAuthors(q: string, skip: number, limit: number) {
  const pattern = new RegExp(escapeRegex(q), "i");
  const filter = {
    status: "active",
    $or: [{ username: pattern }, { displayName: pattern }, { penName: pattern }],
  };

  const [items, total] = await Promise.all([
    User.find(filter)
      .select("username displayName avatarUrl penName creatorStatus bio")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ]);

  return {
    total,
    items: items.map((u: any) => ({
      username: u.username,
      displayName: u.displayName ?? u.username,
      avatarUrl: u.avatarUrl ?? null,
      penName: u.penName ?? null,
      bio: u.bio ?? null,
      isCreator: u.creatorStatus === "active",
    })),
  };
}

// No text index on Tag — stays on the anchored-regex approach from the
// navbar dropdown, just paginated and sorted by usageCount.
async function searchTags(q: string, skip: number, limit: number) {
  const pattern = new RegExp(escapeRegex(q), "i");
  const filter = { name: pattern };

  const [items, total] = await Promise.all([
    Tag.find(filter)
      .select("name slug category usageCount")
      .sort({ usageCount: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Tag.countDocuments(filter),
  ]);

  return {
    total,
    items: items.map((t: any) => ({
      name: t.name,
      slug: t.slug,
      category: t.category,
      usageCount: t.usageCount,
    })),
  };
}