// app/api/notifications/unsubscribe/route.ts — one-click unsubscribe, no auth required (token IS the auth)
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { NotificationPreference } from "@/app/api/lib/models/NotificationPreference";
import { ok, fail } from "@/app/api/response";

export const GET = async (req: Request) => {
  try {
    const token = new URL(req.url).searchParams.get("token");
    if (!token) return fail({ message: "Missing token", status: 400 });

    await connectToDatabase();
    await NotificationPreference.updateOne(
      { unsubscribeToken: token },
      { $set: { emailCommentReply: false, emailNewComment: false, emailChapterPublished: false, emailReadingReminder: false, emailMarketing: false } }
    );

    return ok({ unsubscribed: true }); // frontend should render a plain confirmation page here
  } catch (error) {
    return fail(error);
  }
};

export const POST = GET; // support List-Unsubscribe-Post one-click header, which fires POST not GET