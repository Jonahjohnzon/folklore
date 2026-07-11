/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { Types } from "mongoose";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { Chapter } from "@/app/api/lib/models/Chapter";
import { ChapterUnlock } from "@/app/api/lib/models/ChapterUnlock";
import { User } from "@/app/api/lib/models/User";
import { Transaction } from "@/app/api/lib/models/Transaction";
import { withAuth } from "@/app/api/auth/withAuth";
import { ok, fail } from "@/app/api/response";
import { optionalAuth } from "@/app/api/auth/optionalAuth";
import { Book } from "@/app/api/lib/models/Book";
import { dispatchNotification } from "@/app/api/lib/notifications/dispatch";

interface UnlockResult {
  newBalance: number;
  alreadyUnlocked?: boolean;
}

export const POST = withAuth(async (req, ctx) => {
  await connectToDatabase();
  const params = await ctx.params;
  const chapterId = Array.isArray(params.chapterId) ? params.chapterId[0] : params.chapterId;
  if (!chapterId) return fail("Invalid chapter id");

  const userId = req.user?.sub;
  if (!userId) return fail("Sign in required");

  const chapter = await Chapter.findById(chapterId).select("bookId coinsRequired accessType title").lean();
  if (!chapter) return fail("Chapter not found");

  const book = await Book.findById(chapter.bookId).select("authorId title slug").lean();
  const authorId = book?.authorId ? String(book.authorId) : null;
  const isAuthor = authorId && authorId === String(userId);
  if (isAuthor) {
    return ok({ unlocked: true, newBalance: null, isAuthor: true });
  }

  if (chapter.accessType !== "coins" && chapter.accessType !== "purchase") {
    return ok({ unlocked: true, newBalance: null, alreadyFree: true });
  }

  const price = chapter.coinsRequired ?? 0;
  const bookId = chapter.bookId;

  const existing = await ChapterUnlock.exists({ chapterId, userId });
  if (existing) {
    const user = await User.findById(userId).select("coinBalance").lean();
    return ok({ unlocked: true, newBalance: user?.coinBalance ?? 0, alreadyUnlocked: true });
  }

  const session = await mongoose.startSession();

  async function runUnlock(params: {
    userId: string;
    chapterId: string | string[];
    bookId: Types.ObjectId;
    price: number;
    authorId: string | null;
  }): Promise<UnlockResult> {
    const { userId, chapterId, bookId, price, authorId } = params;
    let txResult: UnlockResult | undefined;

    await session.withTransaction(async () => {
      // Debit the reader — atomic guard against insufficient balance.
      const debited = await User.findOneAndUpdate(
        { _id: userId, coinBalance: { $gte: price } },
        { $inc: { coinBalance: -price } },
        { new: true, select: "coinBalance", session }
      );
      if (!debited) throw new Error("INSUFFICIENT_COINS");

      // Create the unlock record — unique index protects against races.
      try {
        await ChapterUnlock.create(
          [{ chapterId, userId, bookId, coinsSpent: price }],
          { session }
        );
      } catch (err: any) {
        if (err?.code === 11000) {
          // Someone else unlocked it concurrently — refund and report already-unlocked.
          const refunded = await User.findByIdAndUpdate(
            userId,
            { $inc: { coinBalance: price } },
            { new: true, select: "coinBalance", session }
          );
          txResult = { newBalance: refunded?.coinBalance ?? 0, alreadyUnlocked: true };
          return;
        }
        throw err;
      }

      // Ledger entry: reader's debit.
      await Transaction.create(
        [
          {
            userId,
            type: "chapter_unlock",
            status: "completed",
            coins: -price,
            balanceAfter: debited.coinBalance,
            label: `Unlocked chapter for ${price} coins`,
            chapterId,
            storyId: bookId,
            recipientUserId: authorId ?? undefined,
          },
        ],
        { session }
      );

      // Credit the author and ledger the credit side.
      if (price > 0 && authorId) {
        const credited = await User.findByIdAndUpdate(
          authorId,
          { $inc: { coinBalance: price } },
          { new: true, select: "coinBalance", session }
        );
        await Transaction.create(
          [
            {
              userId: authorId,
              type: "tip",
              status: "completed",
              coins: price,
              balanceAfter: credited?.coinBalance,
              label: `Earned ${price} coins from a chapter unlock`,
              chapterId,
              storyId: bookId,
              recipientUserId: userId,
            },
          ],
          { session }
        );
      }

      await Chapter.findByIdAndUpdate(chapterId, { $inc: { purchaseCount: 1 } }, { session });

      txResult = { newBalance: debited.coinBalance };
    });

    if (!txResult) throw new Error("UNKNOWN_TX_FAILURE");
    return txResult;
  }

  let result: UnlockResult;
  try {
    result = await runUnlock({ userId, chapterId, bookId, price, authorId });
  } catch (err: any) {
    if (err?.message === "INSUFFICIENT_COINS") return fail("Not enough coins");
    throw err;
  } finally {
    await session.endSession();
  }

  // --- notifications: fire only after the transaction has committed ---
  // Skip entirely for the race-refund path (alreadyUnlocked) and for free
  // chapters (price === 0) — nothing actually changed hands in either case.
  if (!result.alreadyUnlocked && price > 0 && book) {
    const chapterLink = `/book/${book.slug}/chapter/${chapterId}`;
    const fullChapterLink = `https://tipatale.com${chapterLink}`;

    // Notify the author they earned coins.
    if (authorId) {
      await dispatchNotification({
        userId: authorId,
        type: "earnings_update",
        actorId: userId,
        bookId,
        chapterId,
        message: `You earned ${price} coins from a chapter unlock on ${book.title}`,
        link: chapterLink,
        email: {
          templateName: "earningsUpdateTemplate",
          templateArgs: {
            bookTitle: book.title,
            chapterTitle: chapter.title,
            coins: price,
            link: fullChapterLink,
          },
        },
      });
    }

    // Confirm to the reader that the chapter is now unlocked.
    await dispatchNotification({
      userId,
      type: "chapter_unlocked",
      bookId,
      chapterId,
      message: `You unlocked "${chapter.title}" for ${price} coins`,
      link: chapterLink,
      email: {
        templateName: "chapterUnlockedTemplate",
        templateArgs: {
          bookTitle: book.title,
          chapterTitle: chapter.title,
          coins: price,
          newBalance: result.newBalance,
          link: fullChapterLink,
        },
      },
    });
  }

  return ok({ unlocked: true, newBalance: result.newBalance, alreadyUnlocked: result.alreadyUnlocked });
});

export const GET = optionalAuth(async (req, ctx) => {
  await connectToDatabase();
  const { chapterId } = await ctx.params;
  if (!chapterId) return fail("Invalid chapter id");

  const userId = req.user?.sub;
  const unlocked = userId ? Boolean(await ChapterUnlock.exists({ chapterId, userId })) : false;
  return ok({ unlocked });
});