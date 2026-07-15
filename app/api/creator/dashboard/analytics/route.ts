// app/api/creator/dashboard/analytics/route.ts
import { withAuth } from "@/app/api/auth/withAuth";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { Types } from "mongoose";
import { Book } from "@/app/api/lib/models/Book";
import { Chapter } from "@/app/api/lib/models/Chapter";
import { ChapterUnlock } from "@/app/api/lib/models/ChapterUnlock";
import { DailyStat } from "@/app/api/lib/models/DailyStat";
import { Follow } from "@/app/api/lib/models/Follow";
import { ok, fail } from "@/app/api/response";
import { ReadingProgress } from "@/app/api/lib/models/ReadingProgress";

function isoDaysAgo(n: number): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - n);
  return d;
}

function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function fillDays(range: number, map: Map<string, number>) {
  const out: { date: string; value: number }[] = [];
  for (let i = range - 1; i >= 0; i--) {
    const key = dateKey(isoDaysAgo(i));
    out.push({ date: key, value: map.get(key) ?? 0 });
  }
  return out;
}

export const GET = withAuth(async (req) => {
  try {
    await connectToDatabase();
    const url = new URL(req.url);
    const range = Math.min(90, Math.max(7, Number(url.searchParams.get("range")) || 30));
    const since = isoDaysAgo(range - 1);
    const sinceKey = dateKey(since);
    const authorId = new Types.ObjectId(req.user.sub);

    const books = await Book.find({ authorId: req.user.sub }).select("_id title").lean();
    const bookIds = books.map((b) => b._id);
    const bookTitleById = new Map(books.map((b) => [String(b._id), b.title]));

    const [
      readsAgg,
      earningsAgg,
      topChaptersAgg,
      followersAgg,
      completionAgg,
      topReadChaptersAgg,
    ] = await Promise.all([
      // Dashboard-wide raw pageview trend. Intentionally NOT deduped by
      // user — this is meant to show total traffic volume over time, and
      // DailyStat has no userId to dedupe by anyway.
      DailyStat.aggregate([
        { $match: { bookId: { $in: bookIds }, date: { $gte: sinceKey } } },
        { $group: { _id: "$date", reads: { $sum: "$reads" } } },
      ]),
      ChapterUnlock.aggregate([
        { $match: { bookId: { $in: bookIds }, createdAt: { $gte: since } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            coins: { $sum: "$coinsSpent" },
          },
        },
      ]),
      // Top chapters by coin unlocks (revenue) — distinct from most-read.
      ChapterUnlock.aggregate([
        { $match: { bookId: { $in: bookIds } } },
        { $group: { _id: "$chapterId", coins: { $sum: "$coinsSpent" }, unlocks: { $sum: 1 } } },
        { $sort: { coins: -1 } },
        { $limit: 5 },
      ]),
      Follow.aggregate([
        { $match: { targetType: "author", authorId, createdAt: { $gte: since } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
      ]),
      // Completion rate — per-user furthest chapter reached, from
      // ReadingProgress (has userId; DailyStat does not).
      ReadingProgress.aggregate([
        { $match: { bookId: { $in: bookIds } } },
        { $group: { _id: { bookId: "$bookId", userId: "$userId" }, maxOrder: { $max: "$chapterOrderIndex" } } },
        {
          $lookup: {
            from: "books",
            localField: "_id.bookId",
            foreignField: "_id",
            as: "book",
          },
        },
        { $unwind: "$book" },
        {
          $group: {
            _id: "$_id.bookId",
            title: { $first: "$book.title" },
            totalChapters: { $first: "$book.totalChapters" },
            readers: { $sum: 1 },
            finishers: {
              $sum: {
                $cond: [
                  { $and: [{ $gt: ["$book.totalChapters", 0] }, { $gte: ["$maxOrder", "$book.totalChapters"] }] },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]),
      // Most-read chapters by UNIQUE reader — from ReadingProgress, not
      // DailyStat. ReadingProgress is upserted on { userId, chapterId },
      // so each user contributes exactly one document per chapter no
      // matter how many times they reread it — repeat opens update
      // lastReadAt on the same doc instead of creating a new one.
      // Counting documents therefore counts distinct readers, correctly
      // collapsing repeats to "one," which DailyStat's raw $inc counter
      // cannot do since it has no userId to dedupe against.
      ReadingProgress.aggregate([
        { $match: { bookId: { $in: bookIds } } },
        { $group: { _id: "$chapterId", uniqueReaders: { $sum: 1 } } },
        { $sort: { uniqueReaders: -1 } },
        { $limit: 5 },
      ]),
    ]);

    const bookCompletionRates = completionAgg.map((b) => ({
      bookId: String(b._id),
      title: b.title as string,
      readers: b.readers as number,
      finishers: b.finishers as number,
      rate: b.readers > 0 ? Math.round((b.finishers / b.readers) * 1000) / 10 : 0,
    }));

    const chapterIds = Array.from(
      new Set([
        ...topChaptersAgg.map((c) => String(c._id)),
        ...topReadChaptersAgg.map((c) => String(c._id)),
      ])
    );
    const chapters = chapterIds.length
      ? await Chapter.find({ _id: { $in: chapterIds } }).select("title bookId").lean()
      : [];
    const chapterById = new Map(chapters.map((c) => [String(c._id), c]));

    const readsMap = new Map(readsAgg.map((r) => [r._id as string, r.reads]));
    const earningsMap = new Map(earningsAgg.map((e) => [e._id as string, e.coins]));
    const followersMap = new Map(followersAgg.map((f) => [f._id as string, f.count]));
    const totalReaders = completionAgg.reduce((s, b) => s + b.readers, 0);
    const totalFinishers = completionAgg.reduce((s, b) => s + b.finishers, 0);
    const overallCompletionRate = totalReaders > 0 ? Math.round((totalFinishers / totalReaders) * 1000) / 10 : 0;
    const totalEarnings = earningsAgg.reduce((s, e) => s + e.coins, 0);
    const splitKey = dateKey(isoDaysAgo(Math.floor(range / 2)));
    const earningsFirstHalf = earningsAgg.filter((e) => e._id < splitKey).reduce((s, e) => s + e.coins, 0);
    const earningsSecondHalf = totalEarnings - earningsFirstHalf;
    const earningsTrendPct =
      earningsFirstHalf > 0
        ? Math.round(((earningsSecondHalf - earningsFirstHalf) / earningsFirstHalf) * 100)
        : earningsSecondHalf > 0
        ? 100
        : 0;

    return ok({
      range,
      readsByDay: fillDays(range, readsMap).map((d) => ({ date: d.date, reads: d.value })),
      earningsByDay: fillDays(range, earningsMap).map((d) => ({ date: d.date, coins: d.value })),
      followersByDay: fillDays(range, followersMap).map((d) => ({ date: d.date, followers: d.value })),
      totalEarnings,
      earningsTrendPct,
      overallCompletionRate,
      bookCompletionRates,
      readsInstrumented: readsAgg.length > 0,
      topChapters: topChaptersAgg.map((c) => {
        const chapter = chapterById.get(String(c._id));
        return {
          chapterId: String(c._id),
          title: chapter?.title ?? "Untitled chapter",
          bookTitle: bookTitleById.get(String(chapter?.bookId)) ?? "",
          coins: c.coins,
          unlocks: c.unlocks,
        };
      }),
      topReadChapters: topReadChaptersAgg.map((c) => {
        const chapter = chapterById.get(String(c._id));
        return {
          chapterId: String(c._id),
          title: chapter?.title ?? "Untitled chapter",
          bookTitle: bookTitleById.get(String(chapter?.bookId)) ?? "",
          uniqueReaders: c.uniqueReaders,
        };
      }),
    });
  } catch (error) {
    return fail(error);
  }
});