// app/api/admin/books/[id]/warn/route.ts
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { Book } from "@/app/api/lib/models/Book";
import { ok, fail } from "@/app/api/response";
import { withAdmin } from "../../../withAdmin";
import { dispatchNotification } from "@/app/api/lib/notifications/dispatch";

export const POST = withAdmin(async (req,ctx) => {
  try {
    await connectToDatabase();

    const { id } = await ctx.params;
    if (!id) {
      return fail(new Error("Invalid book id"));
    }

    const { message } = await req.json();
    if (!message || typeof message !== "string" || !message.trim()) {
      return fail(new Error("Warning message is required"));
    }

    const book = await Book.findById(id).select("title authorId").lean();
    if (!book) return fail(new Error("Book not found"));

    await dispatchNotification({
      userId: book.authorId,
      type: "admin_warning",
      bookId: book._id,
      message: `Warning regarding "${book.title}": ${message.trim()}`,
      link: `/book/${book._id}`,
      // no `email` field → in-app notification only
    });

    return ok({ sent: true });
  } catch (error) {
    return fail(error);
  }
});