import Link from "next/link";
import { StarRating } from "@/app/components/ui/StarRating";
import type { Book } from "@/app/types";

interface BookCardProps {
  book: Book;
  showSynopsis?: boolean;
}

export function BookCard({ book, showSynopsis = false }: BookCardProps) {
  return (
    <Link
      href={`/book/${book.slug}`}
      className="group flex flex-col cursor-pointer"
    >
      {/* Cover */}
      <div className="relative mb-2.5 self-start w-full">
        <div className="w-full aspect-2/3 relative">
          <div
            className={`absolute inset-0 bg-linear-to-br ${book.coverGradient} rounded-sm shadow-book group-hover:shadow-card-hover transition-shadow duration-200`}
          >
            {/* Spine */}
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-black/20 rounded-l-sm" />

            {/* Emoji */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl leading-none" aria-hidden="true">
                {book.coverEmoji}
              </span>
            </div>

            {/* Badge */}
            {book.badge && (
              <span
                className={`absolute top-1.5 left-1.5 text-[0.5rem] font-bold uppercase tracking-widest px-1.5 py-0.5 leading-none ${
                  book.badge === "Hot"      ? "bg-crimson text-white"  :
                  book.badge === "New"      ? "bg-gold text-white"     :
                  book.badge === "Free"     ? "bg-black/60 text-white" :
                  "bg-ink text-page"
                }`}
              >
                {book.badge}
              </span>
            )}
          </div>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/10 transition-colors duration-200 rounded-sm" />
        </div>
      </div>

      {/* Meta */}
      <p className="text-2xs uppercase tracking-widest text-crimson font-semibold mb-0.5 truncate">
        {book.subGenre ?? book.genre}
      </p>
      <h3 className="font-serif text-sm font-bold text-ink leading-tight mb-0.5 line-clamp-2 group-hover:text-crimson transition-colors">
        {book.title}
      </h3>
      <p className="text-2xs text-ink-muted mb-1 truncate">{book.author}</p>

      <div className="flex items-center gap-1.5">
        <StarRating rating={book.rating} showValue={false} />
        <span className="text-2xs text-ink-faint">{book.rating.toFixed(1)}</span>
        <span className="text-2xs text-border">·</span>
        <span className="text-2xs text-ink-faint">{book.reads}</span>
      </div>

      {showSynopsis && (
        <p className="text-xs text-ink-muted mt-1.5 line-clamp-2 font-body italic leading-snug">
          {book.synopsis}
        </p>
      )}
    </Link>
  );
}