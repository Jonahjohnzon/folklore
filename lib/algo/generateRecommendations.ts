// lib/algo/generateRecommendations.ts
import { Types } from "mongoose";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { AlgoSignal } from "@/app/api/lib/models/Algo";
import { Recommendation } from "@/app/api/lib/models/Algo";
import { Book } from "@/app/api/lib/models/Book";
import { User } from "@/app/api/lib/models/User";
import { recencyDecay, weightForSignal } from "./scoring";

const SIGNAL_WINDOW_DAYS = 90;
const CANDIDATES_PER_TAG_SOURCE = 30;
const TOP_N_PER_USER = 20;
const SIMILAR_READER_LIMIT = 15;
const ONBOARDING_TAG_BASELINE = 1.5;

interface TagAffinity {
  [tagId: string]: number;
}

/**
 * Reads a user's raw AlgoSignal history and produces a tag → affinity score
 * map, decayed by recency and weighted by signal type. This is the "taste
 * profile" the rest of the algorithm scores candidate books against.
 */
async function buildTagAffinity(userId: Types.ObjectId): Promise<{
  affinity: TagAffinity;
  readBookIds: Set<string>;
}> {
  const since = new Date(Date.now() - SIGNAL_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const user = await User.findById(userId).select("interestTags").lean();

  const affinity: TagAffinity = {};
  for (const tagId of user?.interestTags ?? []) {
    affinity[String(tagId)] = ONBOARDING_TAG_BASELINE;
  }

  const signals = await AlgoSignal.find({ userId, createdAt: { $gte: since } })
    .select("signal bookId payload createdAt")
    .lean();

  const readBookIds = new Set(signals.filter((s) => s.bookId).map((s) => String(s.bookId)));

  const bookIds = [...readBookIds].map((id) => new Types.ObjectId(id));
  const touchedBooks = await Book.find({ _id: { $in: bookIds } }).select("tags").lean();
  const tagsByBook = new Map(touchedBooks.map((b) => [String(b._id), b.tags.map(String)]));

  // no re-declaration here — writes into the same affinity map seeded above
  for (const s of signals) {
    const w = weightForSignal(s.signal, s.payload ?? {}) * recencyDecay(s.createdAt);
    if (w === 0) continue;

    if (s.bookId) {
      const tags = tagsByBook.get(String(s.bookId)) ?? [];
      for (const tagId of tags) {
        affinity[tagId] = (affinity[tagId] ?? 0) + w / Math.max(tags.length, 1);
      }
    }
    if (s.tagId) {
      affinity[String(s.tagId)] = (affinity[String(s.tagId)] ?? 0) + w;
    }
  }

  return { affinity, readBookIds };
}

/**
 * "Readers who share your taste also read..." — finds other users whose
 * recent signals hit the same books/tags as this user, then surfaces books
 * THOSE users rated highly that our user hasn't touched yet. Cheap
 * approximation of collaborative filtering without a full matrix factorization.
 */
async function findSimilarReaderPicks(
  userId: Types.ObjectId,
  readBookIds: Set<string>
): Promise<Map<string, number>> {
  if (readBookIds.size === 0) return new Map();

  const bookObjectIds = [...readBookIds].map((id) => new Types.ObjectId(id));

  // users who touched the same books, excluding ourselves
  const overlappingUsers = await AlgoSignal.aggregate([
    { $match: { bookId: { $in: bookObjectIds }, userId: { $ne: userId } } },
    { $group: { _id: "$userId", overlapCount: { $sum: 1 } } },
    { $sort: { overlapCount: -1 } },
    { $limit: SIMILAR_READER_LIMIT },
  ]);

  const similarUserIds = overlappingUsers.map((u) => u._id);
  if (similarUserIds.length === 0) return new Map();

  const theirStrongSignals = await AlgoSignal.find({
    userId: { $in: similarUserIds },
    signal: { $in: ["completed_book", "purchased_chapter", "reviewed"] },
    bookId: { $nin: bookObjectIds }, // exclude what our user already touched
  })
    .select("bookId signal")
    .lean();

  const scores = new Map<string, number>();
  for (const s of theirStrongSignals) {
    if (!s.bookId) continue;
    const key = String(s.bookId);
    scores.set(key, (scores.get(key) ?? 0) + weightForSignal(s.signal, {}));
  }
  return scores;
}

/**
 * Full pipeline for one user: build taste profile → score candidates by
 * tag overlap → boost with collaborative signal → upsert top N as
 * Recommendation rows. Called per-user by the batch job below.
 */
export async function generateRecommendationsForUser(userId: Types.ObjectId) {
  const { affinity, readBookIds } = await buildTagAffinity(userId);
  const tagIds = Object.keys(affinity).map((id) => new Types.ObjectId(id));

  const readObjectIds = [...readBookIds].map((id) => new Types.ObjectId(id));

  // Candidate pool: books sharing at least one tag with the user's affinity,
  // capped and not already read. Falls back to nothing if the user has no
  // affinity yet — cold-start is handled by the home endpoint, not here.
  const candidates =
    tagIds.length > 0
      ? await Book.find({
          tags: { $in: tagIds },
          status: { $in: ["ongoing", "completed", "hiatus"] },
          _id: { $nin: readObjectIds },
        })
          .select("tags totalReads")
          .limit(CANDIDATES_PER_TAG_SOURCE * tagIds.length)
          .lean()
      : [];

  const similarReaderScores = await findSimilarReaderPicks(userId, readBookIds);

  const scored = candidates.map((book) => {
    const tagScore = book.tags.reduce((sum:number, t:Types.ObjectId) => sum + (affinity[String(t)] ?? 0), 0);
    const collabScore = similarReaderScores.get(String(book._id)) ?? 0;
    const popularityNudge = Math.log10((book.totalReads ?? 0) + 1) * 0.3; // small tiebreaker only

    return {
      bookId: book._id,
      score: tagScore + collabScore * 1.5 + popularityNudge,
      reasonCode: collabScore > tagScore ? "similar_readers" : "tag_match",
    };
  });

  // pull in similar-reader books that had zero tag overlap too
  for (const [bookId, collabScore] of similarReaderScores) {
    if (!scored.find((s) => String(s.bookId) === bookId)) {
      scored.push({ bookId: new Types.ObjectId(bookId), score: collabScore * 1.5, reasonCode: "similar_readers" });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, TOP_N_PER_USER);

  await Recommendation.deleteMany({ userId });
  if (top.length > 0) {
    await Recommendation.insertMany(
      top.map((r, i) => ({
        userId,
        bookId: r.bookId,
        score: r.score,
        reasonCode: r.reasonCode,
        rank: i + 1,
      }))
    );
  }
}

/**
 * Batch entrypoint — regenerates recommendations for every user who has
 * logged at least one signal in the lookback window. Meant to run on a
 * schedule (cron), not per-request.
 */
export async function generateAllRecommendations() {
  await connectToDatabase();
  const since = new Date(Date.now() - SIGNAL_WINDOW_DAYS * 24 * 60 * 60 * 1000);

  const activeUserIds = await AlgoSignal.distinct("userId", { createdAt: { $gte: since } });
  let processed = 0;
  for (const userId of activeUserIds) {
    await generateRecommendationsForUser(userId);
    processed++;
  }
  return { usersProcessed: processed };
}