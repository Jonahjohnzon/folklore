// components/continue-reading-banner.tsx
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ContinueReadingItem } from "@/app/services/HomeService";

export function ContinueReadingBanner({ item }: { item: ContinueReadingItem }) {
  return (
    <Link
      href={`/book/${item.slug}/chapter/${item.chapterId}`}
      className="flex items-center gap-3 border-b border-hairline bg-surface px-4 py-2.5 transition hover:bg-bg sm:px-6"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.coverUrl ?? "/placeholder-cover.png"}
        alt={item.title}
        className="h-10 w-7 shrink-0 rounded object-cover"
      />

      <div className="min-w-0 flex-1">
        <p className="font-sans text-[11px] font-semibold uppercase tracking-wide text-accent">
          Continue Reading
        </p>
        <p className="truncate font-sans text-sm text-ink">
          {item.title} <span className="text-ink-muted">· {item.chapterTitle}</span>
        </p>
      </div>

      <ArrowRight size={16} className="shrink-0 text-ink-muted" />
    </Link>
  );
}