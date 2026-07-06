// lib/notifications/dispatch.ts
import { Types } from "mongoose";
import { Notification } from "@/app/api/lib/models/Notification";
import { NotificationPreference } from "@/app/api/lib/models/NotificationPreference";
import { User } from "@/app/api/lib/models/User";
import { sendEmail } from "@/lib/email/send";
import type { NotificationType } from "@/app/api/lib/types";
import * as templates from "@/lib/email/templates";
import type { INotificationPreference } from "@/app/api/lib/models/NotificationPreference";

interface DispatchInput {
  userId: Types.ObjectId | string;
  type: NotificationType;
  actorId?: Types.ObjectId | string;
  bookId?: Types.ObjectId | string;
  chapterId?: string | string[];
  commentId?: Types.ObjectId | string;
  reviewId?: Types.ObjectId | string;
  message: string;
  link: string;
  email?: {
    templateName: keyof typeof templates;
    templateArgs: Record<string, string>;
  };
}
// Limit to the keys that actually exist on INotificationPreference
type EmailPrefField = Extract<
  | "emailCommentReply"
  | "emailNewComment"
  | "emailChapterPublished"
  | "emailReadingReminder"
  | "emailNewReview"
  | "emailPayoutInitiated"
  | "emailPayoutCompleted"
  | "emailEarningsUpdate"
  | "emailSubscriptionExpiring",
  keyof INotificationPreference
>;

// maps notification type -> the preference field that gates its email
const PREFERENCE_FIELD: Record<NotificationType, EmailPrefField | null> = {
  comment_reply: "emailCommentReply",
  new_comment: "emailNewComment",
  chapter_published: "emailChapterPublished",
  reading_reminder: "emailReadingReminder",
  book_completed_series: "emailChapterPublished",
  mention: "emailCommentReply",
  new_chapter: "emailChapterPublished",
  new_review: "emailNewReview",
  review_vote: null,
  new_follower: null,
  payout_initiated: null,
  payout_completed: null,
  earnings_update: null,
  subscription_expiring: null,
}

export async function dispatchNotification(input: DispatchInput) {
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

  if (!input.email) return;

  const [user, pref] = await Promise.all([
    User.findById(input.userId).select("email emailVerified").lean(),
    NotificationPreference.findOne({ userId: input.userId }).lean(),
  ]);

  if (!user?.email || !user.emailVerified) return;

  const prefField = PREFERENCE_FIELD[input.type];
  const enabled = prefField ? pref?.[prefField] !== false : true;
  if (!enabled) return;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const templateFn = templates[input.email.templateName] as (args: any) => { subject: string; html: string; text: string };
  const { subject, html, text } = templateFn(input.email.templateArgs);

  // await sendEmail({
  //   to: user.email,
  //   subject,
  //   html,
  //   text,
  //   unsubscribeToken: pref?.unsubscribeToken,
  // });
}