// components/chapter-paragraph.tsx
"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { withDropCap } from "@/lib/reader-blocks";

function removeFontFamily(html: string) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.querySelectorAll("[style]").forEach((el) => {
    if (!(el instanceof HTMLElement)) return;
    el.style.removeProperty("font-family");
    if (el.style.length === 0) el.removeAttribute("style");
  });
  return doc.body.innerHTML;
}

export function ChapterParagraph({
  html,
  index,
  isFirst,
  commentCount,
  stripFontFamily,
  fontStack,
  onOpenComments,
}: {
  html: string;
  index: number;
  isFirst: boolean;
  commentCount: number;
  stripFontFamily: boolean;
  fontStack: string;
  onOpenComments: (index: number) => void;
}) {
  const rendered = stripFontFamily ? removeFontFamily(html) : html;
  const finalHtml = isFirst ? withDropCap(rendered) : rendered;

  // Tap-to-reveal for touch, where there's no hover to rely on. Desktop
  // visibility is handled entirely by the `group-hover` CSS class below —
  // no mouseenter/mouseleave state involved, so there's nothing to get
  // stuck showing a stale paragraph's icon when the pointer moves quickly.
  const [revealed, setRevealed] = useState(false);

  const iconVisible = commentCount > 0 || revealed;

  return (
    <div
      className="group/para relative -mx-4 mb-0 select-none cursor-pointer rounded-lg px-4 py-0.5 transition active:bg-black/5 hover:bg-black/[0.025] sm:-mx-6 sm:px-6 last:mb-0"
      onClick={() => setRevealed((r) => !r)}
    >
      <div
        className={`prose-block px-8 ${isFirst ? "cr-first-block" : ""}`}
        dangerouslySetInnerHTML={{ __html: finalHtml }}
        style={{ fontFamily: fontStack }}
      />
      <button
        onClick={(e) => {
          e.stopPropagation();
          onOpenComments(index);
        }}
        aria-label={commentCount > 0 ? `View ${commentCount} comments` : "Add a comment"}
        className={`absolute right-6 top-1 z-10 flex touch-manipulation items-center gap-1 rounded-full border px-2.5 py-1.5 font-sans text-[11px] transition-opacity duration-150 lg:py-1 ${
          commentCount > 0 ? "border-accent/40 bg-accent/10 text-accent" : "border-hairline text-ink-muted"
        } ${iconVisible ? "opacity-100" : "opacity-0"} group-hover/para:opacity-100`}
      >
        <MessageCircle size={12} />
        {commentCount > 0 && commentCount}
      </button>
    </div>
  );
}