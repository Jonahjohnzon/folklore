"use client";

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

  return (
    <div className="group/para relative -mx-4 mb-0 rounded-lg px-4 py-0.5 transition hover:bg-black/2.5 sm:-mx-6 sm:px-6 last:mb-0">
      <div
        className={`prose-block px-8 ${isFirst ? "cr-first-block" : ""}`}
        dangerouslySetInnerHTML={{ __html: finalHtml }}
        style={{ fontFamily: fontStack }}
      />
      <button
        onClick={() => onOpenComments(index)}
        aria-label={commentCount > 0 ? `View ${commentCount} comments` : "Add a comment"}
        className={`absolute right-6 cursor-pointer top-1 flex items-center gap-1 rounded-full border px-2.5 py-1 font-sans text-[11px] transition ${
          commentCount > 0
            ? "border-accent/40 bg-accent/10 text-accent opacity-100"
            : "border-hairline text-ink-muted opacity-0 group-hover/para:opacity-100"
        }`}
      >
        <MessageCircle size={12} />
        {commentCount > 0 && commentCount}
      </button>
    </div>
  );
}