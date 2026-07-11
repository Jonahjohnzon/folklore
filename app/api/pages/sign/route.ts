import { withAuth } from "@/app/api/auth/withAuth";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { Book } from "@/app/api/lib/models/Book";
import { Chapter } from "@/app/api/lib/models/Chapter";
import { ok, fail } from "@/app/api/response";
import { ValidationError, NotFoundError, ForbiddenError } from "@/app/api/lib/db/errors";
import { signUpload } from "@/app/api/lib/cloudinary";

/**
 * Only hands out signatures for folders we recognise, and only for
 * resources the requesting user actually owns — otherwise a signed
 * upload is just as open as an unsigned one, it just has a nicer name.
 */
export const POST = withAuth(async (req) => {
  try {
    const body = await req.json();
    const folder = typeof body?.folder === "string" ? body.folder : "";

    if (folder === "avatars") {
      return ok(signUpload(`avatars/${req.user.sub}`));
    }

    const bookCoverMatch = folder.match(/^books\/([a-f0-9]{24})\/cover$/i);
    if (bookCoverMatch) {
      await connectToDatabase();
      const book = await Book.findById(bookCoverMatch[1]);
      if (!book) throw new NotFoundError("Book not found");
      if (String(book.authorId) !== String(req.user.sub)) {
        throw new ForbiddenError("You don't have access to this book");
      }
      return ok(signUpload(folder));
    }

    const chapterCoverMatch = folder.match(
      /^books\/([a-f0-9]{24})\/chapters\/([a-f0-9]{24})\/cover$/i
    );
    if (chapterCoverMatch) {
      const [, bookId, chapterId] = chapterCoverMatch;
      await connectToDatabase();
      const book = await Book.findById(bookId);
      if (!book) throw new NotFoundError("Book not found");
      if (String(book.authorId) !== String(req.user.sub)) {
        throw new ForbiddenError("You don't have access to this book");
      }
      const chapter = await Chapter.findById(chapterId);
      if (!chapter || String(chapter.bookId) !== String(book._id)) {
        throw new NotFoundError("Chapter not found");
      }
      return ok(signUpload(folder));
    }

    throw new ValidationError("Unknown upload folder", { folder: ["Not a recognised upload target"] });
  } catch (error) {
    return fail(error);
  }
});