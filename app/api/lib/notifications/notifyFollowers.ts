// lib/notifications/notifyFollowers.ts
import { Follow } from "@/app/api/lib/models/Follow";
import { dispatchNotification } from "./dispatch";

export async function notifyFollowersOfNewChapter(
  bookId: string,
  authorId: string,
  bookTitle: string,
  chapterId: string,
  chapterTitle: string,
  authorName: string,
  bookSlug: string
) {
  const [bookFollowers, authorFollowers] = await Promise.all([
    Follow.find({ targetType: "book", bookId }).select("followerId").lean(),
    Follow.find({ targetType: "author", authorId }).select("followerId").lean(),
  ]);

  // dedupe — someone might follow both the book and the author
  const followerIds = new Set([
    ...bookFollowers.map((f) => String(f.followerId)),
    ...authorFollowers.map((f) => String(f.followerId)),
  ]);

  const link = `/book/${bookSlug}/chapter/${chapterId}`;

  await Promise.allSettled(
    Array.from(followerIds).map((followerId) =>
      dispatchNotification({
        userId: followerId,
        type: "chapter_published",
        bookId,
        chapterId,
        message: `New chapter of ${bookTitle}: ${chapterTitle}`,
        link,
        email: {
          templateName: "chapterPublishedTemplate",
          templateArgs: { bookTitle, chapterTitle, authorName, link: `https://yourdomain.com${link}` },
        },
      })
    )
  );
}