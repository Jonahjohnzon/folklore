// components/review-list.tsx
import { Star } from "lucide-react";
import type { ManageReviewDTO } from "@/app/services/DashboardService";

export function ReviewList({ reviews }: { reviews: ManageReviewDTO[] }) {
  if (reviews.length === 0) {
    return <p className="py-6 text-center font-sans text-sm text-ink-muted">No reviews yet.</p>;
  }

  return (
    <div className="space-y-3">
      {reviews.map((r) => (
        <div key={r.id} className="rounded-xl border border-hairline bg-bg p-4">
          <div className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={r.avatarUrl ?? "/placeholder-avatar.png"}
              alt={r.username}
              className="h-8 w-8 rounded-full object-cover"
            />
            <div>
              <p className="font-sans text-sm font-semibold text-ink">{r.username}</p>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={11} className={i < r.rating ? "fill-gold text-gold" : "text-hairline"} />
                ))}
              </div>
            </div>
          </div>
          <p className="prose-reader mt-2.5 text-sm text-ink">{r.body}</p>
        </div>
      ))}
    </div>
  );
}