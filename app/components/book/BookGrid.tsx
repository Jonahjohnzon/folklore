import { BookCard } from "./BookCard";
import type { Book } from "@/app/types";
import { cn } from "@/app/lib/utils";

interface BookGridProps {
  books: Book[];
  cols?: "6" | "5" | "4";
  showSynopsis?: boolean;
  className?: string;
}

const colStyles = {
  "6": "grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6",
  "5": "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5",
  "4": "grid-cols-2 sm:grid-cols-3 md:grid-cols-4",
};

export function BookGrid({ books, cols = "6", showSynopsis, className }: BookGridProps) {
  return (
    <div className={cn("grid gap-x-3 gap-y-5", colStyles[cols], className)}>
      {books.map((book) => (
        <BookCard key={book.id} book={book} showSynopsis={showSynopsis} />
      ))}
    </div>
  );
}