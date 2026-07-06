import Link from "next/link";
import { BookCover } from "@/app/components/ui/BookCover";
import { StarRating } from "@/app/components/ui/StarRating";
import type { Book } from "@/app/types";

interface EditorCardProps {
  book: Book;
}

export function EditorCard({ book }: EditorCardProps) {
  return (
    <Link
      href={`/book/${book.slug}`}
      className="group flex border border-border bg-surface hover:border-ink-muted transition-colors duration-200"
    >
      {/* Cover strip */}
      <BookCover book={book} size="md" showBadge={false} className="rounded-none" />

      {/* Body */}
      <div className="flex flex-col flex-1 min-w-0 p-4">
        <p className="text-2xs uppercase tracking-widest text-crimson font-semibold mb-1.5">
          {book.subGenre ?? book.genre}
        </p>
        <h3 className="font-serif text-lg font-bold text-ink leading-tight mb-1.5 group-hover:text-crimson transition-colors">
          {book.title}
        </h3>
        <p className="text-xs text-ink-muted mb-2">by {book.author}</p>
        <p className="font-body italic text-sm text-ink-muted leading-snug line-clamp-2 flex-1">
          {book.synopsis}
        </p>
        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-border-soft">
          <span className="text-2xs text-ink-faint">{book.reads} reads</span>
          <StarRating rating={book.rating} size="sm" />
        </div>
      </div>
    </Link>
  );
}