import { connectToDatabase } from "@/app/api/lib/db/connect";
import { ChapterCommentCount } from "@/app/api/lib/models/ChapterCommentCount";
import { ok, fail } from "@/app/api/response";

export async function GET(_req: Request, { params }: { params: Promise<{ chapterId: string }> }) {
  try {
    await connectToDatabase();
    const { chapterId } = await params;
    if (!chapterId) return fail("Invalid chapter id");
    const doc = await ChapterCommentCount.findOne({ chapterId }).lean();
    console.log(doc)
    const counts = (doc?.counts as Record<string, number>) ?? {};
    return ok({ counts });
  } catch (error) {
    return fail(error);
  }
}