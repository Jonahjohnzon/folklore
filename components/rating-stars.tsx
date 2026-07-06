import { Star } from "lucide-react";

interface RatingStarsProps {
  rating: number;
  size?: number;
  showValue?: boolean;
  count?: number;
}

export function RatingStars({ rating, size = 14, showValue = false, count }: RatingStarsProps) {
  const full = Math.round(rating);
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={size}
            className={i < full ? "fill-accent text-accent" : "fill-none text-hairline"}
          />
        ))}
      </span>
      {showValue && <span className="font-sans text-xs font-semibold text-ink">{rating.toFixed(1)}</span>}
      {typeof count === "number" && (
        <span className="font-sans text-xs text-ink-muted">({count.toLocaleString()})</span>
      )}
    </span>
  );
}