// app/sitemap.ts
import type { MetadataRoute } from "next";
import { BookService } from "@/app/services/BookService";

const SITE_URL = "https://tipatale.com";

// Cache the generated sitemap for an hour rather than rebuilding it on
// every crawler hit — book/chapter lists don't change fast enough to
// justify hitting the DB on every request.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/browse/new`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];

  let bookRoutes: MetadataRoute.Sitemap = [];
  let chapterRoutes: MetadataRoute.Sitemap = [];

  try {
    // Expects: { data: { books: { slug: string; updatedAt: string }[] } }
    const { data } = await BookService.listAllSlugs();

    bookRoutes = data.books.map((b) => ({
      url: `${SITE_URL}/book/${b.slug}`,
      lastModified: new Date(b.updatedAt),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    // Chapters are the bulk of the sitemap and change less predictably
    // (new chapter = new URL), so fetch them per-book alongside the book
    // list rather than a second top-level call, to avoid an N+1 pattern
    // if listAllSlugs can return chapter refs directly. Adjust to match
    // your actual API shape.
    const chapterLists = await Promise.all(
      data.books.map((b) =>
        BookService.getChaptersBySlug(b.slug)
          .then(({ data }) =>
            data.chapters
              .filter((c) => c.unlocked !== false) // skip locked/premium chapters if flagged
              .map((c) => ({
                url: `${SITE_URL}/book/${b.slug}/chapter/${c._id}`,
                lastModified: new Date(b.updatedAt),
                changeFrequency: "monthly" as const,
                priority: 0.5,
              }))
          )
          .catch(() => [])
      )
    );
    chapterRoutes = chapterLists.flat();
  } catch {
    // If the books list fails to load, still return the static routes
    // rather than a 500 — a partial sitemap is far better than no sitemap.
  }

  return [...staticRoutes, ...bookRoutes, ...chapterRoutes];
}