import { cn } from "@/app/lib/utils";
import type { Book } from "@/app/types";

interface BookCoverProps {
  book: Pick<Book, "title" | "coverGradient" | "coverEmoji" | "badge">;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showBadge?: boolean;
  className?: string;
}

const sizeStyles = {
  xs: { wrap: "w-8 h-12",   emoji: "text-base" },
  sm: { wrap: "w-10 h-[60px]", emoji: "text-lg" },
  md: { wrap: "w-20 h-[120px]", emoji: "text-3xl" },
  lg: { wrap: "w-28 h-[168px]", emoji: "text-4xl" },
  xl: { wrap: "w-36 h-[216px]", emoji: "text-5xl" },
};

const badgeStyles: Record<string, string> = {
  Hot:      "bg-crimson text-white",
  New:      "bg-gold text-white",
  Free:     "bg-black/60 text-white",
  Complete: "bg-ink text-page",
};

export function BookCover({ book, size = "md", showBadge = true, className }: BookCoverProps) {
  const s = sizeStyles[size];
  return (
    <div
      className={cn(
        "relative rounded-sm shrink-0 overflow-hidden bg-linear-to-br shadow-book select-none",
        book.coverGradient,
        s.wrap,
        className
      )}
    >
      {/* Spine shadow */}
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-black/20" />

      {/* Emoji art */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
        <span className={cn("leading-none", s.emoji)} aria-hidden="true">
          {book.coverEmoji}
        </span>
        {size === "xl" && (
          <span className="text-[0.5rem] uppercase tracking-widest text-white/50 text-center px-2 leading-tight mt-1">
            {book.title}
          </span>
        )}
      </div>

      {/* Badge overlay */}
      {showBadge && book.badge && (
        <span
          className={cn(
            "absolute top-1 left-1 text-[0.5rem] font-bold uppercase tracking-wider px-1 py-0.5 leading-none",
            badgeStyles[book.badge] ?? "bg-ink/60 text-white"
          )}
        >
          {book.badge}
        </span>
      )}
    </div>
  );
}