import { BookCard } from "./BookCard";
import type { Book } from "@/app/types";

interface BookRowProps {
  books: Book[];
}

export function BookRow({ books }: BookRowProps) {
  return (
    <div className="overflow-x-auto scrollbar-hide -mx-4 md:-mx-6 lg:-mx-8">
      <div className="flex gap-3 px-4 md:px-6 lg:px-8 pb-2">
        {books.map((book) => (
          <div key={book.id} className="shrink-0 w-28 sm:w-32">
            <BookCard book={book} />
          </div>
        ))}
      </div>
    </div>
  );
}