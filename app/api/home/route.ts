/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/home/route.ts
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { Book } from "@/app/api/lib/models/Book";
import { Tag } from "@/app/api/lib/models/Tag";
import {  Recommendation } from "@/app/api/lib/models/Algo";
import { ok, fail } from "@/app/api/response";
import { optionalAuth } from "@/app/api/auth/optionalAuth";
import { User } from "../lib/models/User";
// app/api/home/route.ts
import { ReadingProgress } from "@/app/api/lib/models/ReadingProgress";
import { Types } from "mongoose";

const VISIBLE = ["ongoing", "completed", "hiatus"];
const RAIL_SIZE = 16;

function serializeBook(b: any) {
  const author = b.authorId as { penName?: string; username: string } | null;
  return {
    id: String(b._id),
    slug: b.slug,
    title: b.title,
    description: b.description ?? null,
    coverUrl: b.coverUrl ?? null,
    totalChapters: b.totalChapters,
    totalReads: b.totalReads ?? 0,
    author: { penName: author?.penName ?? author?.username ?? "Unknown" },
  };
}



// app/api/home/route.ts

async function getContinueReading(userId: string) {
  const entries = await ReadingProgress.aggregate([
    { $match: { userId: new Types.ObjectId(userId), completed: false } },
    { $sort: { lastReadAt: -1 } },
    { $limit: 1 }, // only ever need the single most recent unfinished book
  ]);

  if (entries.length === 0) return null;
  const entry = entries[0];

  const book = await Book.findById(entry.bookId)
    .select("title slug coverUrl authorId")
    .populate("authorId", "penName username")
    .lean();

  if (!book) return null;

  return {
    ...serializeBook(book),
    chapterId: String(entry.chapterId),
    chapterTitle: entry.chapterTitle,
    progressPct: entry.progressPct ?? 0,
  };
}
async function getPersonalized(userId: string) {
  const recs = await Recommendation.find({ userId })
    .sort({ rank: 1 })
    .limit(RAIL_SIZE)
    .populate({ path: "bookId", populate: { path: "authorId", select: "penName username" } })
    .lean();
  return recs.filter((r) => r.bookId).map((r) => serializeBook(r.bookId));
}

async function getTrending() {
  const books = await Book.find({ status: { $in: VISIBLE } })
    .select("title slug description coverUrl totalChapters authorId totalReads")
    .sort({ totalReads: -1 })
    .limit(RAIL_SIZE)
    .populate("authorId", "penName username")
    .lean();
  return books.map(serializeBook);
}

async function getNewReleases() {
  const books = await Book.find({ status: { $in: VISIBLE }, publishedAt: { $ne: null } })
    .select("title slug description coverUrl totalChapters authorId publishedAt totalReads")
    .sort({ publishedAt: -1 })
    .limit(RAIL_SIZE)
    .populate("authorId", "penName username")
    .lean();
  return books.map(serializeBook);
}

async function getGenrePicks(genreSlug: string) {
  const tag = await Tag.findOne({ slug: genreSlug }).select("_id").lean();
  if (!tag) return [];
  const books = await Book.find({ status: { $in: VISIBLE }, tags: tag._id })
    .select("title slug description coverUrl totalChapters authorId totalReads")
    .sort({ totalReads: -1 })
    .limit(RAIL_SIZE)
    .populate("authorId", "penName username")
    .lean();
  return books.map(serializeBook);
}

async function getCompletedBooks() {
  const books = await Book.find({ status: "completed" })
    .select("title slug description coverUrl totalChapters authorId totalReads")
    .sort({ totalReads: -1 })
    .limit(RAIL_SIZE)
    .populate("authorId", "penName username")
    .lean();
  return books.map(serializeBook);
}

export const GET = optionalAuth(async (req) => {
  try {
    await connectToDatabase();

    const [trending, newReleases, fantasy, romance, thriller, completed] = await Promise.all([
      getTrending(),
      getNewReleases(),
      getGenrePicks("fantasy"),
      getGenrePicks("romance"),
      getGenrePicks("thriller"),
      getCompletedBooks()
    ]);

     let continueReading: Awaited<ReturnType<typeof getContinueReading>> = null;
    let personalized: ReturnType<typeof serializeBook>[] = [];
    let needsOnboarding = false;

    // narrow once — req.user is nullable, but everything inside this
    // block should treat it as guaranteed present
    const userId = req.user?.sub;

    

      if (userId) {
        const [continueReadingResult, personalizedResult, userDoc] = await Promise.all([
          getContinueReading(String(userId)),
          getPersonalized(String(userId)),
          User.findById(userId).select("onboardingCompletedAt").lean(),
        ]);

      continueReading = continueReadingResult;
        personalized = personalizedResult;
        needsOnboarding = !userDoc?.onboardingCompletedAt;
    }

    return ok({
      needsOnboarding,
      continueReading, // now a single object or null, not an array
      personalized: personalized.length > 0 ? personalized : trending,
      personalizedIsFallback: personalized.length === 0,
      trending,
      newReleases,
      fantasy,
      romance,
      thriller,
      completed
    });
  } catch (error) {
    return fail(error);
  }
});