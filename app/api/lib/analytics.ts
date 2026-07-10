// lib/analytics.ts
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { DailyStat } from "@/app/api/lib/models/DailyStat";

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function recordChapterRead(bookId: string, chapterId: string) {
  await connectToDatabase();
  await DailyStat.updateOne(
    { chapterId, date: todayKey() },
    { $inc: { reads: 1 }, $setOnInsert: { bookId } },
    { upsert: true }
  );
}