import Link from "next/link";
import { BookCover } from "@/app/components/ui/BookCover";
import type { Book } from "@/app/types";

interface RankedListProps {
  books: Book[];
  columns?: 1 | 2;
}

function RankRow({ book, rank }: { book: Book; rank: number }) {
  return (
    <Link
      href={`/book/${book.slug}`}
      className="flex items-center gap-3 py-2.5 border-b border-border-soft last:border-0 group"
    >
      <span className="font-serif text-2xl font-black text-border min-w-7 text-right leading-none shrink-0">
        {rank}
      </span>
      <BookCover book={book} size="xs" showBadge={false} />
      <div className="flex-1 min-w-0">
        <p className="text-2xs uppercase tracking-widest text-crimson font-semibold mb-0.5">
          {book.subGenre ?? book.genre}
        </p>
        <p className="font-serif text-sm font-bold text-ink leading-tight group-hover:text-crimson transition-colors line-clamp-1">
          {book.title}
        </p>
        <p className="text-2xs text-ink-muted mt-0.5">
          {book.author} · {book.reads} reads · ★ {book.rating}
        </p>
      </div>
      {book.badge && (
        <span
          className={`shrink-0 text-2xs px-1.5 py-0.5 border font-bold uppercase tracking-widest leading-none ${
            book.badge === "Hot"
              ? "bg-crimson-pale border-crimson-border text-crimson"
              : "bg-gold-pale border-gold-border text-gold"
          }`}
        >
          {book.badge}
        </span>
      )}
    </Link>
  );
}

export function RankedList({ books, columns = 2 }: RankedListProps) {
  if (columns === 1) {
    return (
      <div>
        {books.map((book, i) => (
          <RankRow key={book.id} book={book} rank={i + 1} />
        ))}
      </div>
    );
  }

  const half = Math.ceil(books.length / 2);
  const left  = books.slice(0, half);
  const right = books.slice(half);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
      <div>{left.map((book, i) => <RankRow key={book.id} book={book} rank={i + 1} />)}</div>
      <div>{right.map((book, i) => <RankRow key={book.id} book={book} rank={half + i + 1} />)}</div>
    </div>
  );
}