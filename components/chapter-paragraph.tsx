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
const MOVE_CANCEL_PX = 24;

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
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressFired = useRef(false);
  const start = useRef({ x: 0, y: 0 });

  function clearTimer() {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }

  function onPointerDown(e: React.PointerEvent) {
    // Desktop already has hover-to-reveal; only run the press gesture for touch/pen.
    if (e.pointerType === "mouse") return;
    start.current = { x: e.clientX, y: e.clientY };
    longPressFired.current = false;
    clearTimer();
    timer.current = setTimeout(() => {
      longPressFired.current = true;
      onOpenComments(index);
    }, LONG_PRESS_MS);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (e.pointerType === "mouse" || !timer.current) return;
    const dx = Math.abs(e.clientX - start.current.x);
    const dy = Math.abs(e.clientY - start.current.y);
    if (dx > MOVE_CANCEL_PX || dy > MOVE_CANCEL_PX) clearTimer();
  }

  function onPointerUp(e: React.PointerEvent) {
    if (e.pointerType === "mouse") return;
    clearTimer();
  }

  function onClick(e: React.MouseEvent) {
    // Suppress the reveal-toggle when this click follows a long-press-open,
    // since touch devices fire a click right after touchend/pointerup too.
    if (longPressFired.current) {
      longPressFired.current = false;
      return;
    }
    setRevealed((r) => !r);
  }

  return (
    <div
      className="group/para relative -mx-4 mb-0 rounded-lg px-4 py-0.5 transition active:bg-black/5 lg:hover:bg-black/2.5 sm:-mx-6 sm:px-6 last:mb-0"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={clearTimer}
      onClick={onClick}
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