import { connectToDatabase } from "@/app/api/lib/db/connect";
import { Book } from "@/app/api/lib/models/Book";
import { Chapter } from "@/app/api/lib/models/Chapter";
import { ChapterUnlock } from "@/app/api/lib/models/ChapterUnlock";
import { BookTheme } from "@/app/api/lib/models/BookTheme";
import { ReadingProgress } from "@/app/api/lib/models/ReadingProgress";
import { LibraryEntry } from "@/app/api/lib/models/LibraryEntry";
import { DailyStat } from "@/app/api/lib/models/DailyStat";
import { BadgeAwardService } from "@/app/api/lib/badges/BadgeAwardService";
import { ok, fail } from "@/app/api/response";
import { NotFoundError, ForbiddenError } from "@/app/api/lib/db/errors";
import { withAuth } from "@/app/api/auth/withAuth";
const VISIBLE_STATUSES = ["ongoing", "completed", "hiatus"];

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export const GET = withAuth(async (req, ctx) => {
  try {
    await connectToDatabase();
    const { slug, chapterId } = await ctx.params;
    const book = await Book.findOne({ slug: slug, status: { $in: VISIBLE_STATUSES } }).lean();
    if (!book) throw new NotFoundError("Book not found");

    const published = await Chapter.find({ bookId: book._id, publishedAt: { $ne: null } })
      .select("_id orderIndex")
      .sort({ orderIndex: 1 })
      .lean();
    const theme = await BookTheme.findOne({ bookId: book._id }).lean();
    const idx = published.findIndex((c) => String(c._id) === chapterId);
    if (idx === -1) throw new NotFoundError("Chapter not found");

    const chapter = await Chapter.findById(chapterId).lean();
    if (!chapter) throw new NotFoundError("Chapter not found");

    const userId = req.user?.sub;
    const isOwnBook = Boolean(book.authorId && userId && String(book.authorId) === String(userId));

    // --- paywall enforcement ---
    // This must happen before anything below reads/returns chapter.content.
    // The book-detail page gates navigation behind the unlock modal, but a
    // reader can hit this route directly by URL, so the check has to live
    // here too — never trust the client to have already paid.
    const isPaidChapter = chapter.accessType === "coins" || chapter.accessType === "purchase";
    if (isPaidChapter && !isOwnBook) {
      if (!userId) {
        throw new ForbiddenError("Sign in and unlock this chapter to read it");
      }
      const hasUnlock = await ChapterUnlock.exists({ chapterId, userId });
      if (!hasUnlock) {
        throw new ForbiddenError("Unlock this chapter with coins to read it");
      }
    }

    await Book.updateOne({ _id: book._id }, { $inc: { totalReads: 1 } });

    // Feeds the creator dashboard's daily-reads chart. Excludes the author's
    // own reads/previews of their own book, same as the badge-crediting rule
    // below — an author opening their own chapter shouldn't count as a read.
    if (!isOwnBook) {
      await DailyStat.updateOne(
        { chapterId: chapter._id, date: todayKey() },
        { $inc: { reads: 1 }, $setOnInsert: { bookId: book._id } },
        { upsert: true }
      );
    }

    if (userId) {
      const now = new Date();

      // Checked before the upsert specifically so we know whether this is
      // this user's first-ever open of this chapter — the upsert itself
      // doesn't tell you created-vs-matched without inspecting raw driver
      // results, which Mongoose's findOneAndUpdate doesn't expose cleanly.
      const existingProgress = await ReadingProgress.findOne({ userId, chapterId: chapter._id })
        .select("_id")
        .lean();
      const isFirstReadOfChapter = !existingProgress;

      await ReadingProgress.findOneAndUpdate(
        { userId, chapterId: chapter._id },
        {
          $set: {
            bookId: book._id,
            chapterOrderIndex: chapter.orderIndex,
            chapterTitle: chapter.title,
            bookTitle: book.title,
            bookSlug: book.slug,
            bookCoverUrl: book.coverUrl ?? null,
            totalChapters: book.totalChapters ?? 0,
            lastReadAt: now,
          },
          $setOnInsert: { progressPct: 0, completed: false },
        },
        { upsert: true }
      );

      const existingEntry = await LibraryEntry.findOne({ userId, bookId: book._id });
      if (!existingEntry) {
        await LibraryEntry.create({ userId, bookId: book._id, status: "reading", addedAt: now, lastActivityAt: now });
      } else {
        existingEntry.lastActivityAt = now;
        if (existingEntry.status === "want_to_read") {
          existingEntry.status = "reading";
        }
        await existingEntry.save();
      }

      // Don't credit an author reading/previewing their own book.
      if (isFirstReadOfChapter && !isOwnBook) {
        await BadgeAwardService.recordChapterRead(userId);
      }
    }

    return ok({
      chapter: {
        _id: String(chapter._id),
        bookId: String(chapter.bookId),
        orderIndex: chapter.orderIndex,
        title: chapter.title,
        content: chapter.content ?? "",
        wordCount: chapter.wordCount,
        coverUrl: chapter.coverUrl ?? null,
        accessType: chapter.accessType,
        coinsRequired: chapter.coinsRequired,
        audioId: chapter.audioId ?? null,
      },
      prevId: idx > 0 ? String(published[idx - 1]._id) : null,
      nextId: idx < published.length - 1 ? String(published[idx + 1]._id) : null,
      theme: theme
        ? {
            _id: String(theme._id),
            bookId: String(theme.bookId),
            fontFamily: theme.fontFamily,
            fontSizeBase: theme.fontSizeBase,
            lineHeight: theme.lineHeight,
            bgColor: theme.bgColor,
            textColor: theme.textColor,
            accentColor: theme.accentColor,
            linkColor: theme.linkColor,
            bgMusicUrl: theme.bgMusicUrl ?? null,
            bgMusicVolume: theme.bgMusicVolume,
            customCss: theme.customCss ?? null,
          }
        : {
            _id: null,
            bookId: String(book._id),
            fontFamily: "Georgia",
            fontSizeBase: 16,
            lineHeight: 1.7,
            bgColor: "#FFFFFF",
            textColor: "#1A1A1A",
            accentColor: "#8B5CF6",
            linkColor: "#6D28D9",
            bgMusicUrl: null,
            bgMusicVolume: 0.2,
            customCss: null,
          },
    });
  } catch (error) {
    return fail(error);
  }
});