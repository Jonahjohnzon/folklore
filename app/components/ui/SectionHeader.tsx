import Link from "next/link";
import { cn } from "@/app/lib/utils";

interface SectionHeaderProps {
  title: string;
  titleEm?: string;          // italic part appended after title
  subtitle?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  className?: string;
}

export function SectionHeader({
  title,
  titleEm,
  subtitle,
  viewAllHref = "#",
  viewAllLabel = "View all",
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-baseline justify-between pb-3 mb-4 border-b border-border",
        className
      )}
    >
      <div className="flex items-baseline gap-2">
        <h2 className="font-serif text-xl font-bold text-ink tracking-tight">
          {title}
          {titleEm && (
            <em className="font-serif text-crimson not-italic ml-1 italic">{titleEm}</em>
          )}
        </h2>
        {subtitle && (
          <span className="text-2xs uppercase tracking-widest text-ink-faint hidden sm:block">
            {subtitle}
          </span>
        )}
      </div>
      {viewAllHref && (
        <Link
          href={viewAllHref}
          className="text-2xs uppercase tracking-widest text-ink-muted hover:text-crimson transition-colors font-medium flex items-center gap-1"
        >
          {viewAllLabel}
          <span aria-hidden="true">→</span>
        </Link>
      )}
    </div>
  );
}