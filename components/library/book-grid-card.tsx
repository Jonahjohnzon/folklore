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
    <Link href={`/book/${entry.book.slug}`} className="group block">
      <div className="relative overflow-hidden rounded-lg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={entry.book.coverUrl ?? "/placeholder-cover.png"}
          alt={entry.book.title}
          className="aspect-2/3 w-full object-cover transition group-hover:scale-[1.02]"
        />
        <span
          className={`absolute left-1.5 top-1.5 flex items-center gap-1 rounded-full px-2 py-0.5 font-sans text-[10px] font-medium ${meta.className}`}
        >
          <Icon size={10} />
          {meta.label}
        </span>
      </div>
      <p className="mt-2 truncate font-sans text-sm font-semibold text-ink">{entry.book.title}</p>
      <p className="font-sans text-xs text-ink-muted">
        {entry.status === "want_to_read"
          ? `Saved ${formatRelativeDate(entry.addedAt)}`
          : `Updated ${formatRelativeDate(entry.updatedAt)}`}
      </p>
    </Link>
  );
}