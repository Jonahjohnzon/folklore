import { Types } from "mongoose";
import { Notification } from "@/app/api/lib/models/Notification";
import { NotificationPreference } from "@/app/api/lib/models/NotificationPreference";
import { User } from "@/app/api/lib/models/User";
import { sendEmail } from "@/app/api/lib/email/send";
import type { NotificationType } from "@/app/api/lib/types";
import * as templates from "@/app/api/lib/email/templates";
import type { INotificationPreference } from "@/app/api/lib/models/NotificationPreference";

interface DispatchInput {
  userId: Types.ObjectId | string;
  type: NotificationType;
  actorId?: Types.ObjectId | string;
  bookId?: Types.ObjectId | string;
  chapterId?: Types.ObjectId | string;
  commentId?: Types.ObjectId | string;
  reviewId?: Types.ObjectId | string;
  message: string;
  link: string;
  email?: {
    templateName: keyof typeof templates;
    templateArgs: Record<string, string | number>;
  };
}

type PrefField = Extract<
  "notifyNewChapter" | "notifyComments" | "notifyReviews" | "notifyNewFollower",
  keyof INotificationPreference
>;

interface BulkDispatchInput {
  userIds: (Types.ObjectId | string)[];
  type: NotificationType;
  actorId?: Types.ObjectId | string;
  bookId?: Types.ObjectId | string;
  chapterId?: Types.ObjectId | string;
  commentId?: Types.ObjectId | string;
  reviewId?: Types.ObjectId | string;
  message: string;
  link: string;
  // If provided, recipients who set this field to false are dropped before insert.
  preferenceField?: PrefField;
}

// maps notification type -> the preference field that gates BOTH channels
const PREFERENCE_FIELD: Record<NotificationType, PrefField | null> = {
  comment_reply: "notifyComments",
  new_comment: "notifyComments",
  chapter_published: "notifyNewChapter",
  reading_reminder: null,
  book_completed_series: "notifyNewChapter",
  mention: "notifyComments",
  new_chapter: "notifyNewChapter",
  new_review: "notifyReviews",
  review_vote: null,
  new_follower: "notifyNewFollower",
  payout_initiated: null,
  payout_completed: null,
  earnings_update: null,
  subscription_expiring: null,
  chapter_unlocked: null,
  admin_warning: null,
  book_deleted: null,
};

/**
 * Single-recipient dispatch: writes the site notification AND sends an email
 * (if `email` is provided and the user's preferences allow it).
 * Use for 1:1 events — comment replies, new comments, reviews, payouts, etc.
 */
export async function dispatchNotification(input: DispatchInput) {
  const prefField = PREFERENCE_FIELD[input.type];

  const [user, pref] = await Promise.all([
    input.email
      ? User.findById(input.userId).select("email emailVerified").lean()
      : Promise.resolve(null),
    prefField || input.email
      ? NotificationPreference.findOne({ userId: input.userId }).lean()
      : Promise.resolve(null),
  ]);

  const inAppEnabled = prefField ? pref?.[prefField] !== false : true;

  // Always write the notification unless the user has explicitly muted this category.
  if (inAppEnabled) {
    await Notification.create({
      userId: input.userId,
      type: input.type,
      actorId: input.actorId,
      bookId: input.bookId,
      chapterId: input.chapterId,
      commentId: input.commentId,
      reviewId: input.reviewId,
      message: input.message,
      link: input.link,
    });
  }

  if (!input.email) return;
  if (!user?.email || !user.emailVerified) return;
  if (!inAppEnabled) return; // same toggle gates the email too

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const templateFn = templates[input.email.templateName] as (args: any) => {
    subject: string;
    html: string;
    text: string;
  };
  const { subject, html, text } = templateFn(input.email.templateArgs);

  await sendEmail({
    to: user.email,
    subject,
    html,
    text,
    unsubscribeToken: pref?.unsubscribeToken,
  });
}

/**
 * Bulk dispatch: writes one Notification doc per recipient in a single
 * insertMany. Site notifications ONLY — no email, no per-user queries beyond
 * one preference lookup to filter out anyone who's muted this category.
 * Use for fan-out events — chapter published to followers/library, book
 * completed, announcements, etc.
 */
export async function dispatchBulkNotifications(input: BulkDispatchInput) {
  if (input.userIds.length === 0) return;

  let targetIds = input.userIds.map((id) => new Types.ObjectId(id));

  if (input.preferenceField) {
    const optedOut = await NotificationPreference.find({
      userId: { $in: targetIds },
      [input.preferenceField]: false,
    })
      .select("userId")
      .lean();

    const optedOutSet = new Set(optedOut.map((p) => String(p.userId)));
    targetIds = targetIds.filter((id) => !optedOutSet.has(String(id)));
  }

  if (targetIds.length === 0) return;

  await Notification.insertMany(
    targetIds.map((userId) => ({
      userId,
      type: input.type,
      actorId: input.actorId,
      bookId: input.bookId,
      chapterId: input.chapterId,
      commentId: input.commentId,
      reviewId: input.reviewId,
      message: input.message,
      link: input.link,
    })),
    { ordered: false }
  );
}