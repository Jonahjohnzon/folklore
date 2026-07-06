import Link from "next/link";
import type { Author } from "@/app/types";

interface AuthorCardProps {
  author: Author;
}

export function AuthorCard({ author }: AuthorCardProps) {
  return (
    <Link
      href={`/author/${author.handle.replace("@", "")}`}
      className="group flex flex-col items-center text-center p-5 border border-border bg-surface hover:border-ink-muted hover:bg-surface2 transition-all duration-200"
    >
      {/* Avatar */}
      <div
        className={`w-14 h-14 rounded-full bg-gradient-to-br ${author.coverGradient} flex items-center justify-center border border-border mb-3 flex-shrink-0`}
      >
        <span className="font-serif text-xl font-black text-white/80">
          {author.initials}
        </span>
      </div>

      <h3 className="font-serif text-base font-bold text-ink mb-0.5 group-hover:text-crimson transition-colors">
        {author.name}
      </h3>
      <p className="text-2xs text-ink-muted mb-1">{author.handle}</p>
      <p className="text-2xs text-gold font-semibold mb-1">{author.followers} followers</p>
      <p className="text-2xs text-ink-faint mb-3">{author.genres.join(" · ")}</p>

      <blockquote className="font-body italic text-xs text-ink-muted leading-snug border-t border-border-soft pt-3 mt-auto">
        &ldquo;{author.quote}&rdquo;
      </blockquote>
    </Link>
  );
}