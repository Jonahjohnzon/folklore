import { withAuth } from "@/app/api/auth/withAuth";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { Book } from "@/app/api/lib/models/Book";
import { Chapter } from "@/app/api/lib/models/Chapter";
import { Follow } from "@/app/api/lib/models/Follow";
import { LibraryEntry } from "@/app/api/lib/models/LibraryEntry";
import { User } from "@/app/api/lib/models/User";
import { ok, fail } from "@/app/api/response";
import { NotFoundError, ForbiddenError, ValidationError } from "@/app/api/lib/db/errors";
import { Types } from "mongoose";
import { dispatchBulkNotifications } from "@/app/api/lib/notifications/dispatch";


export const POST = withAuth(async (req, ctx) => {
  try {
    await connectToDatabase();

    const { bookId, chapterId } = await ctx.params;
    const book = await Book.findById(bookId);
    if (!book) throw new NotFoundError("Book not found");
    if (String(book.authorId) !== String(req.user.sub)) {
      throw new ForbiddenError("You don't have access to this book");
    }

    const chapter = await Chapter.findOne({ _id: chapterId, bookId: book._id });
    if (!chapter) throw new NotFoundError("Chapter not found");
    if (!chapter.title.trim() || !chapter.content?.trim()) {
      throw new ValidationError("Chapter needs a title and content before publishing", {});
    }

    const wasAlreadyPublished = !!chapter.publishedAt;

    if (!chapter.publishedAt) {
      chapter.publishedAt = new Date();
    }
    await chapter.save();

    if (book.status === "draft") {
      book.status = "ongoing";
      book.publishedAt = book.publishedAt ?? new Date();
      await book.save();
    }

    // Only notify on the FIRST publish of this chapter — re-saving an already
    // published chapter (typo fix, etc.) shouldn't re-blast every reader.
    if (!wasAlreadyPublished) {
      await notifyChapterPublished({ book, chapter, authorId: req.user.sub });
    }

    return ok({ chapter });
  } catch (error) {
    return fail(error);
  }
});

async function notifyChapterPublished({
  book,
  chapter,
  authorId,
}: {
  book: InstanceType<typeof Book>;
  chapter: InstanceType<typeof Chapter>;
  authorId: string;
}) {
  const [bookFollows, authorFollows, libraryEntries, author] = await Promise.all([
    Follow.find({ targetType: "book", bookId: book._id }).select("followerId").lean(),
    Follow.find({ targetType: "author", authorId: book.authorId }).select("followerId").lean(),
    LibraryEntry.find({
      bookId: book._id,
      status: { $in: ["reading", "want_to_read"] },
    })
      .select("userId")
      .lean(),
    User.findById(authorId).select("blockedUsers penName username").lean(),
  ]);

  const recipientIds = new Set<string>([
    ...bookFollows.map((f) => String(f.followerId)),
    ...authorFollows.map((f) => String(f.followerId)),
    ...libraryEntries.map((l) => String(l.userId)),
  ]);

  recipientIds.delete(String(authorId));

  if (author?.blockedUsers?.length) {
    for (const blockedId of author.blockedUsers) {
      recipientIds.delete(String(blockedId));
    }
  }

  const readersWhoBlockedAuthor = await User.find({
    _id: { $in: Array.from(recipientIds).map((id) => new Types.ObjectId(id)) },
    blockedUsers: authorId,
  })
    .select("_id")
    .lean();
  for (const r of readersWhoBlockedAuthor) {
    recipientIds.delete(String(r._id));
  }

  const finalRecipients = Array.from(recipientIds);
  if (finalRecipients.length === 0) return;

  const authorName = author?.penName || author?.username || "The author";
  const appLink = `/book/${book.slug}/chapter/${chapter._id}`;

    await dispatchBulkNotifications({
      userIds: finalRecipients,
      type: "new_chapter",
      actorId: authorId,
      bookId: book._id,
      chapterId: chapter._id,
      message: `${authorName} published a new chapter: ${chapter.title}`,
      link: appLink,
      preferenceField: "notifyNewChapter", // readers who muted this won't get a notification row at all
    });
}