import Link from "next/link";
import { BookCover } from "@/app/components/ui/BookCover";
import { StarRating } from "@/app/components/ui/StarRating";
import { TRENDING_BOOKS } from "@/app/lib/data";
import type { Book } from "@/app/types";

const featured = TRENDING_BOOKS[0];
const sidebar  = TRENDING_BOOKS.slice(1, 6);

function SidebarItem({ book, rank }: { book: Book; rank: number }) {
  return (
    <Link
      href={`/book/${book.slug}`}
      className="flex items-center gap-3 py-2.5 border-b border-border-soft last:border-0 group"
    >
      <span className="font-serif text-xl font-black text-border min-w-[22px] text-right leading-none">
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
          {book.author} · {book.reads} reads
        </p>
      </div>
      <StarRating rating={book.rating} showValue={false} />
    </Link>
  );
}

export function HeroFeatured() {
  return (
    <section className="bg-surface border-b border-border">
      <div className="max-w-screen-xl mx-auto px-4 md:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1px_300px] gap-0">

          {/* ── Main featured ── */}
          <div className="lg:pr-8 pb-6 lg:pb-0">
            {/* Kicker */}
            <p className="flex items-center gap-2 text-2xs uppercase tracking-widest font-semibold text-crimson mb-3">
              <span className="inline-block w-5 h-px bg-crimson" />
              {"Editor's choice · Dark Fantasy"}
            </p>

            <div className="flex gap-5 items-start">
              {/* Cover */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="absolute inset-0 translate-x-1 translate-y-1 bg-ink/15 rounded-sm" />
                  <BookCover book={featured} size="lg" showBadge={false} className="relative" />
                </div>
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <h1 className="font-serif text-3xl md:text-4xl font-black text-ink leading-[1.05] tracking-tighter mb-2">
                  {featured.title.split(" ").slice(0, -1).join(" ")}{" "}
                  <em className="italic text-crimson-mid">
                    {featured.title.split(" ").slice(-1)}
                  </em>
                </h1>

                <p className="text-xs text-ink-muted mb-4 flex items-center gap-2 flex-wrap">
                  <span>
                    by{" "}
                    <Link
                      href={`/author/${featured.authorHandle}`}
                      className="text-ink font-medium hover:text-crimson transition-colors"
                    >
                      {featured.author}
                    </Link>
                  </span>
                  <span className="text-border">·</span>
                  <span>{featured.chapters} chapters</span>
                  <span className="text-border">·</span>
                  <span>Updated 2 days ago</span>
                </p>

                <p className="font-body text-base text-ink-mid leading-relaxed mb-5 line-clamp-3 md:line-clamp-4">
                  {featured.synopsis}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {featured.tags.slice(0, 4).map((tag) => (
                    <span
                      key={tag}
                      className="text-2xs px-2 py-0.5 border border-border text-ink-muted hover:border-crimson-border hover:text-crimson transition-colors cursor-pointer"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Stats + CTA row */}
            <div className="flex items-center gap-4 pt-4 border-t border-border-soft mt-4 flex-wrap">
              <div className="flex items-center gap-1">
                <StarRating rating={featured.rating} size="md" showValue />
              </div>
              <span className="text-2xs text-border">·</span>
              <span className="text-xs text-ink-muted">
                <strong className="text-ink font-semibold">{featured.reads}</strong> reads
              </span>
              <span className="text-2xs text-border">·</span>
              <span className="text-xs text-ink-muted">
                <strong className="text-ink font-semibold">{featured.libraryCount}</strong> in libraries
              </span>

              <div className="flex items-center gap-2 ml-auto flex-wrap">
                <span className="text-2xs uppercase tracking-widest border border-crimson-border bg-crimson-pale text-crimson px-2 py-0.5">
                  Ongoing
                </span>
                {featured.isMature && (
                  <span className="text-2xs uppercase tracking-widest border border-border text-ink-muted px-2 py-0.5">
                    Mature 17+
                  </span>
                )}
                <Link
                  href={`/book/${featured.slug}`}
                  className="bg-crimson text-white text-xs font-bold uppercase tracking-wider px-5 py-2 hover:bg-crimson-mid transition-colors"
                >
                  Read now →
                </Link>
                <button className="border border-border text-ink-mid text-xs font-medium uppercase tracking-wider px-4 py-2 hover:border-ink-mid transition-colors">
                  + Library
                </button>
              </div>
            </div>
          </div>

          {/* ── Divider ── */}
          <div className="hidden lg:block bg-border mx-0" />

          {/* ── Sidebar trending ── */}
          <div className="hidden lg:block lg:pl-8 pt-0">
            <p className="text-2xs uppercase tracking-widest2 font-semibold text-ink-muted pb-2.5 border-b border-border mb-1">
              Also trending today
            </p>
            {sidebar.map((book, i) => (
              <SidebarItem key={book.id} book={book} rank={i + 2} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}