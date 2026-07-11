import { ReadingProgress } from "@/app/api/lib/models/ReadingProgress";
import { dispatchNotification } from "./dispatch";

const INACTIVITY_DAYS = 4; // nudge if untouched for 4+ days
const MAX_REMINDERS_PER_RUN = 500; // guard against a huge email blast in one batch

export async function sendReadingReminders() {
  const cutoff = new Date(Date.now() - INACTIVITY_DAYS * 24 * 60 * 60 * 1000);

  const staleEntries = await ReadingProgress.aggregate([
    { $match: { completed: false, lastReadAt: { $lt: cutoff } } },
    { $sort: { lastReadAt: -1 } },
    { $group: { _id: "$userId", entry: { $first: "$$ROOT" } } }, // one reminder per user, their most recent stale book
    { $limit: MAX_REMINDERS_PER_RUN },
  ]);

  for (const { entry } of staleEntries) {
    await dispatchNotification({
      userId: entry.userId,
      type: "reading_reminder",
      bookId: entry.bookId,
      chapterId: entry.chapterId,
      message: `Continue reading ${entry.bookTitle}?`,
      link: `/book/${entry.bookSlug}/chapter/${entry.chapterId}`,
      email: {
        templateName: "readingReminderTemplate",
        templateArgs: {
          bookTitle: entry.bookTitle,
          chapterTitle: entry.chapterTitle,
          link: `https://tipatale.com/book/${entry.bookSlug}/chapter/${entry.chapterId}`,
        },
      },
    });
  }

  return { remindersSent: staleEntries.length };
}
