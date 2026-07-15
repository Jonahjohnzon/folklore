// app/api/lib/services/deleteBookCascade.ts
import { Types, startSession, ClientSession } from "mongoose";
import { Book } from "@/app/api/lib/models/Book";
import { Chapter } from "@/app/api/lib/models/Chapter";
import { Comment } from "@/app/api/lib/models/Comment";
import { CommentLike } from "@/app/api/lib/models/CommentLike";
import { ChapterLike } from "@/app/api/lib/models/ChapterLike";
import { ChapterUnlock } from "@/app/api/lib/models/ChapterUnlock";
import { ChapterCommentCount } from "@/app/api/lib/models/ChapterCommentCount";
import { DailyStat } from "@/app/api/lib/models/DailyStat";
import { LibraryEntry } from "@/app/api/lib/models/LibraryEntry";
import { ReadingProgress } from "@/app/api/lib/models/ReadingProgress";

export interface CascadeDeleteResult {
  bookId: string;
  chaptersDeleted: number;
  commentsDeleted: number;
  commentLikesDeleted: number;
  chapterLikesDeleted: number;
  chapterUnlocksDeleted: number;
  dailyStatsDeleted: number;
  libraryEntriesDeleted: number;
  readingProgressDeleted: number;
}

/**
 * Core cascade logic. `session`, if provided, is passed to every query so
 * it participates in the caller's transaction. Without a session it just
 * runs as a sequence of independent deletes (fine for the cron purge,
 * where partial failure just means "next run picks up the rest").
 */
export async function deleteBookCascade(
  bookId: string | Types.ObjectId,
  session?: ClientSession
): Promise<CascadeDeleteResult> {
  const bookObjectId = typeof bookId === "string" ? new Types.ObjectId(bookId) : bookId;
  const opts = session ? { session } : {};

  const chapters = await Chapter.find({ bookId: bookObjectId }, { _id: 1 }, opts).lean();
  const chapterIds = chapters.map((c) => c._id);

  const comments = await Comment.find({ bookId: bookObjectId }, { _id: 1 }, opts).lean();
  const commentIds = comments.map((c) => c._id);

  const [
    commentLikesDeleted,
    chapterLikesDeleted,
    ,
    commentsDeleted,
    chapterUnlocksDeleted,
    dailyStatsDeleted,
    libraryEntriesDeleted,
    readingProgressDeleted,
  ] = await Promise.all([
    CommentLike.deleteMany({ commentId: { $in: commentIds } }, opts),
    ChapterLike.deleteMany({ chapterId: { $in: chapterIds } }, opts),
    ChapterCommentCount.deleteMany({ chapterId: { $in: chapterIds } }, opts),
    Comment.deleteMany({ bookId: bookObjectId }, opts),
    ChapterUnlock.deleteMany({ bookId: bookObjectId }, opts),
    DailyStat.deleteMany({ bookId: bookObjectId }, opts),
    LibraryEntry.deleteMany({ bookId: bookObjectId }, opts),
    ReadingProgress.deleteMany({ bookId: bookObjectId }, opts),
  ]);

  const chaptersDeleted = await Chapter.deleteMany({ bookId: bookObjectId }, opts);
  await Book.deleteOne({ _id: bookObjectId }, opts);

  return {
    bookId: String(bookObjectId),
    chaptersDeleted: chaptersDeleted.deletedCount ?? 0,
    commentsDeleted: commentsDeleted.deletedCount ?? 0,
    commentLikesDeleted: commentLikesDeleted.deletedCount ?? 0,
    chapterLikesDeleted: chapterLikesDeleted.deletedCount ?? 0,
    chapterUnlocksDeleted: chapterUnlocksDeleted.deletedCount ?? 0,
    dailyStatsDeleted: dailyStatsDeleted.deletedCount ?? 0,
    libraryEntriesDeleted: libraryEntriesDeleted.deletedCount ?? 0,
    readingProgressDeleted: readingProgressDeleted.deletedCount ?? 0,
  };
}

/**
 * Transactional wrapper — use this from the admin hard-delete route so a
 * crash midway through doesn't leave orphaned comments/likes/progress
 * rows around with no book to point back to.
 */
export async function deleteBookCascadeTx(bookId: string | Types.ObjectId): Promise<CascadeDeleteResult> {
  const session = await startSession();
  try {
    let result!: CascadeDeleteResult;
    await session.withTransaction(async () => {
      result = await deleteBookCascade(bookId, session);
    });
    return result;
  } finally {
    await session.endSession();
  }
}