import Link from "next/link";
import { BookCover } from "@/app/components/ui/BookCover";
import { StarRating } from "@/app/components/ui/StarRating";
import type { Book } from "@/app/types";

interface GenreShelfProps {
  genre: string;
  count: string;
  books: Book[];
  href?: string;
}

export function GenreShelf({ genre, count, books, href = "#" }: GenreShelfProps) {
  return (
    <div className="flex border border-border overflow-hidden bg-surface">
      {/* Label panel */}
      <div className="bg-ink text-page flex flex-col justify-center px-5 py-6 min-w-[130px] max-w-[130px] flex-shrink-0">
        <p className="text-2xs uppercase tracking-widest2 text-ink-faint mb-2">Genre</p>
        <h3 className="font-serif text-lg font-black leading-tight mb-2 whitespace-pre-line">
          {genre.replace(" ", "\n")}
        </h3>
        <p className="text-2xs text-ink-faint mb-4">{count} titles</p>
        <Link
          href={href}
          className="text-2xs uppercase tracking-widest text-ink-faint hover:text-page transition-colors flex items-center gap-1"
        >
          Browse <span>→</span>
        </Link>
      </div>

      {/* Books strip */}
      <div className="flex flex-1 divide-x divide-border-soft overflow-hidden">
        {books.slice(0, 4).map((book) => (
          <Link
            key={book.id}
            href={`/book/${book.slug}`}
            className="flex-1 flex flex-col p-3 hover:bg-surface2 transition-colors group min-w-0"
          >
            <div className="w-full aspect-[2/3] mb-2">
              <div className={`w-full h-full bg-gradient-to-br ${book.coverGradient} rounded-sm shadow-book relative`}>
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-black/20 rounded-l-sm" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl">{book.coverEmoji}</span>
                </div>
              </div>
            </div>
            <p className="font-serif text-xs font-bold text-ink leading-tight mb-0.5 line-clamp-2 group-hover:text-crimson transition-colors">
              {book.title}
            </p>
            <p className="text-2xs text-ink-muted truncate">{book.author}</p>
            <StarRating rating={book.rating} showValue={false} className="mt-1" />
          </Link>
        ))}
      </div>
    </div>
  );
}