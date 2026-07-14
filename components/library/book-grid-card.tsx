import Link from "next/link";
import { BookOpen, Bookmark, CheckCircle2, XCircle } from "lucide-react";
import type { LibraryEntryDTO, LibraryStatus } from "@/app/services/LibraryService";
import { formatRelativeDate } from "@/lib/format";

const STATUS_META: Record<LibraryStatus, { label: string; icon: typeof BookOpen; className: string }> = {
  reading: { label: "Reading", icon: BookOpen, className: "bg-emerald-100 text-emerald-700" },
  want_to_read: { label: "Want to read", icon: Bookmark, className: "bg-accent/10 text-accent" },
  completed: { label: "Completed", icon: CheckCircle2, className: "bg-hairline/40 text-ink-muted" },
  dropped: { label: "Dropped", icon: XCircle, className: "bg-red-100 text-red-700" },
};

export function BookGridCard({ entry }: { entry: LibraryEntryDTO }) {
  const meta = STATUS_META[entry.status];
  const Icon = meta.icon;

  return (
    <Link
      href={`/book/${entry.book.slug}`}
      className="group block rounded-lg transition active:scale-[0.97] active:opacity-90"
    >
      <div className="relative overflow-hidden rounded-lg bg-hairline/30 shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={entry.book.coverUrl ?? "/placeholder-cover.png"}
          alt={entry.book.title}
          className="aspect-2/3 w-full object-cover transition sm:group-hover:scale-[1.03]"
        />
        <span
          className={`absolute left-1.5 top-1.5 flex max-w-[calc(100%-0.75rem)] items-center gap-1 whitespace-nowrap rounded-full px-1.5 py-0.5 font-sans text-[9px] font-medium shadow-sm sm:px-2 sm:text-[10px] ${meta.className}`}
        >
          <Icon size={10} className="shrink-0" />
          <span className="truncate">{meta.label}</span>
        </span>
      </div>
      <p className="mt-2 line-clamp-2 font-sans text-sm font-semibold leading-snug text-ink sm:group-hover:text-accent">
        {entry.book.title}
      </p>
      <p className="mt-0.5 font-sans text-xs text-ink-muted">
        {entry.status === "want_to_read"
          ? `Saved ${formatRelativeDate(entry.addedAt)}`
          : `Updated ${formatRelativeDate(entry.updatedAt)}`}
      </p>
    </Link>
  );
}