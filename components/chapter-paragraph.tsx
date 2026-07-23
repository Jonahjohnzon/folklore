// components/chapter-paragraph.tsx
"use client";

import React, { useState, useMemo } from "react";
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

interface ChapterParagraphProps {
  html: string;
  index: number;
  isFirst: boolean;
  commentCount: number;
  stripFontFamily: boolean;
  fontStack: string;
  onOpenComments: (index: number) => void;
  highlighted?: boolean;
}

function ChapterParagraphComponent({
  html,
  index,
  isFirst,
  commentCount,
  stripFontFamily,
  fontStack,
  onOpenComments,
  highlighted,
}: ChapterParagraphProps) {
  const [revealed, setRevealed] = useState(false);

  // Recomputing DOMParser + innerHTML on every render is wasted work if
  // html/stripFontFamily/isFirst haven't changed — memoize the expensive part.
  const finalHtml = useMemo(() => {
    const rendered = stripFontFamily ? removeFontFamily(html) : html;
    return isFirst ? withDropCap(rendered) : rendered;
  }, [html, stripFontFamily, isFirst]);

  const displayCount = Math.max(0, commentCount);
  const iconVisible = displayCount > 0 || revealed;

  return (
    <div
      id={`paragraph-${index}`}
      className={`group/para relative -mx-4 mb-0 select-none cursor-pointer rounded-lg px-4 py-0.5 transition active:bg-black/5 hover:bg-black/2.5 sm:-mx-6 sm:px-6 last:mb-0 ${
        highlighted ? "paragraph-highlight" : ""
      }`}
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
        aria-label={displayCount > 0 ? `View ${displayCount} comments` : "Add a comment"}
        className={`absolute right-6 top-1 z-10 flex touch-manipulation items-center gap-1 rounded-full border px-2.5 py-1.5 font-sans text-[11px] transition-opacity duration-150 lg:py-1 ${
          displayCount > 0 ? "border-accent/40 bg-accent/10 text-accent" : "border-hairline text-ink-muted"
        } ${iconVisible ? "opacity-100" : "opacity-0"} group-hover/para:opacity-100`}
      >
        <MessageCircle size={12} />
        {displayCount > 0 && displayCount}
      </button>

      <style jsx>{`
        .paragraph-highlight {
          animation: paragraph-flash 2.5s ease-out;
        }
        @keyframes paragraph-flash {
          0% {
            background-color: color-mix(in srgb, var(--accent) 18%, transparent);
          }
          100% {
            background-color: transparent;
          }
        }
      `}</style>
    </div>
  );
}

export const ChapterParagraph = React.memo(ChapterParagraphComponent);