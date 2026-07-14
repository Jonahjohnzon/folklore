"use client";

import { useRef, useState } from "react";
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

const LONG_PRESS_MS = 500;
const MOVE_CANCEL_PX = 10;

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

  const [revealed, setRevealed] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressFired = useRef(false);
  const touchStart = useRef({ x: 0, y: 0 });

  function clearLongPress() {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }

  function onTouchStart(e: React.TouchEvent) {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
    longPressFired.current = false;
    clearLongPress();
    longPressTimer.current = setTimeout(() => {
      longPressFired.current = true;
      // Haptic-ish confirmation isn't available on web, so just open directly.
      onOpenComments(index);
    }, LONG_PRESS_MS);
  }

  function onTouchMove(e: React.TouchEvent) {
    const t = e.touches[0];
    const dx = Math.abs(t.clientX - touchStart.current.x);
    const dy = Math.abs(t.clientY - touchStart.current.y);
    if (dx > MOVE_CANCEL_PX || dy > MOVE_CANCEL_PX) clearLongPress();
  }

  function onTouchEnd() {
    clearLongPress();
    // Long press already handled opening — don't also toggle reveal.
    if (longPressFired.current) return;
    setRevealed((r) => !r);
  }

  return (
    <div
      className="group/para relative -mx-4 mb-0 rounded-lg px-4 py-0.5 transition active:bg-black/5 lg:hover:bg-black/2.5 sm:-mx-6 sm:px-6 last:mb-0"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={clearLongPress}
    >
      <div
        className={`prose-block px-8 ${isFirst ? "cr-first-block" : ""}`}
        dangerouslySetInnerHTML={{ __html: finalHtml }}
        style={{ fontFamily: fontStack }}
      />
      <button
        onClick={() => onOpenComments(index)}
        aria-label={commentCount > 0 ? `View ${commentCount} comments` : "Add a comment"}
        className={`absolute right-6 top-1 z-10 flex touch-manipulation items-center gap-1 rounded-full border px-2.5 py-1.5 font-sans text-[11px] transition lg:py-1 ${
          commentCount > 0
            ? "border-accent/40 bg-accent/10 text-accent opacity-100"
            : `border-hairline text-ink-muted lg:opacity-0 lg:group-hover/para:opacity-100 ${
                revealed ? "opacity-100" : "opacity-0"
              }`
        }`}
      >
        <MessageCircle size={12} />
        {commentCount > 0 && commentCount}
      </button>
    </div>
  );
}