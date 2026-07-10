import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Book } from "@/lib/types";
import { BookCard } from "./book-card";

export function BookRail({
  title,
  subtitle,
  books,
  href,
  rank = false,
}: {
  title: string;
  subtitle?: string;
  books: Book[];
  href?: string;
  rank?: boolean;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="mb-3 flex items-end justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold text-ink sm:text-2xl">{title}</h2>
          {subtitle && <p className="mt-0.5 font-sans text-sm text-ink-muted">{subtitle}</p>}
        </div>
        {href && (
          <Link href={href} className="flex shrink-0 items-center gap-0.5 font-sans text-sm font-medium text-accent">
            See all <ChevronRight size={15} />
          </Link>
        )}
      </div>

      <div className="rail flex gap-4 overflow-x-auto scrollbar-none pb-2">
        {books.map((b, i) => (
          <div key={b.id} className="relative shrink-0">
            {rank && (
              <span className="pointer-events-none absolute -left-1 -top-1 z-10 font-display text-3xl font-bold text-surface [-webkit-text-stroke:1.5px_var(--accent)] sm:text-4xl">
                {i + 1}
              </span>
            )}
            <BookCard book={b} />
          </div>
        ))}
      </div>
    </section>
  );
}
