import { cn } from "@/app/lib/utils";

interface StarRatingProps {
  rating: number;
  showValue?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function StarRating({ rating, showValue = true, size = "sm", className }: StarRatingProps) {
  const full  = Math.floor(rating);
  const empty = 5 - full;

  return (
    <span className={cn("inline-flex items-center gap-0.5", className)}>
      {Array.from({ length: full  }).map((_, i) => (
        <span key={`f${i}`} className={cn("text-gold", size === "md" ? "text-sm" : "text-xs")}>★</span>
      ))}
      {Array.from({ length: empty }).map((_, i) => (
        <span key={`e${i}`} className={cn("text-border", size === "md" ? "text-sm" : "text-xs")}>★</span>
      ))}
      {showValue && (
        <span className={cn("text-ink-muted ml-1", size === "md" ? "text-xs" : "text-2xs")}>
          {rating.toFixed(1)}
        </span>
      )}
    </span>
  );
}