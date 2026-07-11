// lib/reviews/recalculate-rating.ts
import { Review } from "@/app/api/lib/models/Reviews";
import { Book } from "@/app/api/lib/models/Book";
import { Types } from "mongoose";

export async function recalculateBookRating(bookId: Types.ObjectId | string) {
  const [agg] = await Review.aggregate([
    { $match: { bookId: new Types.ObjectId(bookId) } },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  await Book.updateOne(
    { _id: bookId },
    { averageRating: agg?.avg ?? 0, reviewCount: agg?.count ?? 0 }
  );
}