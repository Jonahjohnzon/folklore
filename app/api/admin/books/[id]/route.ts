// app/api/admin/books/[id]/route.ts
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { Book } from "@/app/api/lib/models/Book";
import { ok, fail } from "@/app/api/response";
import { withAdmin } from "../../withAdmin";
import { deleteBookCascadeTx } from "@/app/api/lib/services/deleteBookCascade";
import { Types } from "mongoose";
import { dispatchNotification } from "@/app/api/lib/notifications/dispatch";

export const DELETE = withAdmin(async (req, ctx) => {
  try {
    await connectToDatabase();

    const params = await ctx.params;
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    if (!id || !Types.ObjectId.isValid(id)) {
      return fail(new Error("Invalid book id"));
    }

   const { searchParams } = new URL(req.url);
    const reason = searchParams.get("reason")?.trim() ?? "";

    const book = await Book.findById(id).select("title authorId").lean();
    if (!book) return fail(new Error("Book not found"));

    const result = await deleteBookCascadeTx(id);

    try {
      await dispatchNotification({
        userId: book.authorId,
        type: "book_deleted",
        message: reason
          ? `Your book "${book.title}" was removed by an admin: ${reason}`
          : `Your book "${book.title}" was removed by an admin.`,
        link: "/dashboard",
        // no `email` field → in-app notification only
      });
    } catch (notifyError) {
      console.error("Failed to notify author of book deletion:", notifyError);
    }

    return ok({ deleted: true, ...result });
  } catch (error) {
    return fail(error);
  }
});