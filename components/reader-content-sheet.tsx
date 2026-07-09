"use client";

import { CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ChapterParagraph } from "@/components/chapter-paragraph";
import { SheetOpeningRule, SHEET_PADDING, SHEET_RADIUS } from "@/lib/sheet-surface";
import { usePaginatedBlocks } from "@/lib/reader-pagination";
import { hasSeenSwipeOnboarding, markSwipeOnboardingSeen } from "@/lib/reader-swipe-onboarding";
import { SwipeOnboardingHint } from "@/components/reader-swipe-onboarding";

// Short chapters just render as one continuous sheet — no point paginating
// something that's already a single screenful.
const PAGINATE_MIN_BLOCKS = 6;
const PAGINATE_MIN_CHARS = 3200;

interface ReaderContentSheetProps {
  blocks: string[];
  commentCounts: Record<string, number>;
  stripFontFamily: boolean;
  fontStack: string;
  fontSize: number;
  lineHeight: number | string;
  ruleColor: string;
  surfaceStyle: CSSProperties;
  onOpenComments: (index: number) => void;
}

export function ReaderContentSheet(props: ReaderContentSheetProps) {
  const { blocks } = props;
  const totalChars = useMemo(
    () => blocks.reduce((sum, b) => sum + b.replace(/<[^>]+>/g, "").length, 0),
    [blocks]
  );
  const shouldPaginate = blocks.length >= PAGINATE_MIN_BLOCKS && totalChars >= PAGINATE_MIN_CHARS;

  if (!shouldPaginate) return <SingleSheet {...props} />;
  return <PagedSheet {...props} />;
}

function SingleSheet({
  blocks, commentCounts, stripFontFamily, fontStack, fontSize, lineHeight, ruleColor, surfaceStyle, onOpenComments,
}: ReaderContentSheetProps) {
  return (
    <div
      className={`prose-reader relative mt-10 border text-ink transition-all duration-500 ease-out ${SHEET_RADIUS} ${SHEET_PADDING}`}
      style={{ fontSize, fontFamily: fontStack, lineHeight, ...surfaceStyle }}
    >
      <SheetOpeningRule color={ruleColor} />
      {blocks.map((block, i) => (
        <ChapterParagraph
          key={i}
          html={block}
          index={i}
          isFirst={i === 0}
          commentCount={commentCounts[i] ?? 0}
          stripFontFamily={stripFontFamily}
          fontStack={fontStack}
          onOpenComments={onOpenComments}
        />
      ))}
    </div>
  );
}

function PagedSheet({
  blocks, commentCounts, stripFontFamily, fontStack, fontSize, lineHeight, ruleColor, surfaceStyle, onOpenComments,
}: ReaderContentSheetProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [pageHeight, setPageHeight] = useState(0);
  const [current, setCurrent] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  const dragState = useRef({ startX: 0, dx: 0, dragging: false });

  // Bigger fonts → taller lines → more rounding slack needed between the
  // hidden measurement sandbox and the real render. Scale the safety
  // margin with fontSize instead of using a flat constant, otherwise
  // large font sizes clip the last line on a page.
  const heightBuffer = Math.max(32, Math.round(fontSize * 2.2));

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const h = entries[0]?.contentRect.height;
      if (h) setPageHeight(h - heightBuffer);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [heightBuffer]);

  const { pages, ready } = usePaginatedBlocks({
    blocks, fontSize, fontStack, lineHeight, stripFontFamily, measureRef, pageHeight,
  });

  useEffect(() => {
    if (ready) setCurrent((c) => Math.min(c, Math.max(0, pages.length - 1)));
  }, [ready, pages.length]);

  useEffect(() => {
    if (ready && pages.length > 1 && !hasSeenSwipeOnboarding()) {
      const t = setTimeout(() => setShowOnboarding(true), 500);
      return () => clearTimeout(t);
    }
  }, [ready, pages.length]);

  const dismissOnboarding = useCallback(() => {
    setShowOnboarding(false);
    markSwipeOnboardingSeen();
  }, []);

  const goTo = useCallback(
    (index: number) => {
      setCurrent(Math.min(Math.max(index, 0), pages.length - 1));
      if (showOnboarding) dismissOnboarding();
    },
    [pages.length, showOnboarding, dismissOnboarding]
  );

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    dragState.current = { startX: e.clientX, dx: 0, dragging: true };
    setIsDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const ds = dragState.current;
    if (!ds.dragging) return;
    const dx = e.clientX - ds.startX;
    ds.dx = dx;
    const atStart = current === 0 && dx > 0;
    const atEnd = current === pages.length - 1 && dx < 0;
    setDragOffset(atStart || atEnd ? dx * 0.35 : dx);
  };

  const endDrag = () => {
    const ds = dragState.current;
    if (!ds.dragging) return;
    const frameWidth = frameRef.current?.clientWidth ?? 1;
    const threshold = frameWidth * 0.18;

    if (ds.dx <= -threshold && current < pages.length - 1) goTo(current + 1);
    else if (ds.dx >= threshold && current > 0) goTo(current - 1);
    else if (showOnboarding) dismissOnboarding();

    dragState.current = { startX: 0, dx: 0, dragging: false };
    setIsDragging(false);
    setDragOffset(0);
  };

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") goTo(current + 1);
      if (e.key === "ArrowLeft") goTo(current - 1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, goTo]);

  const pageWidthPct = pages.length > 0 ? 100 / pages.length : 100;
  const trackTransform = `translateX(calc(${-current * pageWidthPct}% + ${dragOffset}px))`;

  return (
    <div
      className={`prose-reader relative mt-10 border text-ink ${SHEET_RADIUS} ${SHEET_PADDING}`}
      style={{ fontSize, fontFamily: fontStack, lineHeight, ...surfaceStyle }}
    >
      <SheetOpeningRule color={ruleColor} />

      {/* Hidden sandbox used only to measure block heights for pagination */}
      <div ref={measureRef} className="pointer-events-none absolute inset-x-0 top-0 h-0 overflow-hidden opacity-0" aria-hidden />

      {/* group/page scopes the chevron hover so it doesn't leak into per-block group/para hovers below */}
      <div
        ref={frameRef}
        className="group/page relative min-h-180  max-h-225 w-full touch-pan-y select-none overflow-hidden pb-32 pt-10"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={(e) => { if (e.pointerType !== "touch") endDrag(); }}
      >
        {!ready ? (
          <div className="h-full animate-pulse" />
        ) : (
          <div
            className="flex h-full"
            style={{
              width: `${pages.length * 100}%`,
              transform: trackTransform,
              transition: isDragging ? "none" : "transform 420ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            {pages.map((indices, pageIdx) => (
              <div
                key={pageIdx}
                className="h-full shrink-0 overflow-hidden pb-8"
                style={{ width: `${pageWidthPct}%` }}
              >
                {indices.map((blockIdx) => (
                  <ChapterParagraph
                    key={blockIdx}
                    html={blocks[blockIdx]}
                    index={blockIdx}
                    isFirst={blockIdx === 0}
                    commentCount={commentCounts[blockIdx] ?? 0}
                    stripFontFamily={stripFontFamily}
                    fontStack={fontStack}
                    onOpenComments={onOpenComments}
                  />
                ))}
              </div>
            ))}
          </div>
        )}

        <SwipeOnboardingHint visible={showOnboarding} onDismiss={dismissOnboarding} />


      </div>
              {/* Desktop-only chevrons — mobile relies entirely on the drag above */}
       {ready && pages.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Previous page"
                    onClick={() => goTo(current - 1)}
                    disabled={current === 0}
                    className="absolute -left-4 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full border border-hairline bg-surface/90 p-2 text-ink-muted opacity-100 shadow-sm transition-opacity duration-200 hover:text-accent disabled:pointer-events-none disabled:opacity-0 lg:flex lg:group-hover/page:opacity-100"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    aria-label="Next page"
                    onClick={() => goTo(current + 1)}
                    disabled={current === pages.length - 1}
                    className="absolute -right-4 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full border border-hairline bg-surface/90 p-2 text-ink-muted opacity-100 shadow-sm transition-opacity duration-200 hover:text-accent disabled:pointer-events-none disabled:opacity-0 lg:flex lg:group-hover/page:opacity-100"
                  >
                    <ChevronRight size={16} />
                  </button>
                </>
              )}

      {ready && pages.length > 1 && (
        <div className="mt-3 flex items-center justify-center gap-1.5">
          {pages.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to page ${i + 1}`}
              onClick={() => goTo(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current ? "w-5 bg-accent" : "w-1.5 bg-hairline hover:bg-ink-muted"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}