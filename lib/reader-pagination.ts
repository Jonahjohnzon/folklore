// lib/reader-pagination.ts
"use client";
import { useEffect, useState } from "react";

export interface PageBlock {
  paragraphIndex: number;
  html: string;
  isContinuation: boolean;
}

export type ReaderPage = PageBlock[];
function measureHtmlHeight(
  temp: HTMLDivElement,
  html: string
) {
  const wrap = document.createElement("div");
  wrap.className = "prose-block px-8";
  wrap.innerHTML = html;

  temp.appendChild(wrap);

  const h = wrap.getBoundingClientRect().height;

  temp.removeChild(wrap);

  return h;
}

function splitIntoSentences(html: string): string[] {
  const doc = new DOMParser().parseFromString(html, "text/html");

  const text = doc.body.textContent ?? "";

  return text
    .replace(/\s+/g, " ")
    .trim()
    .match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [];
}

export function usePaginatedBlocks({
  blocks,
  fontSize,
  fontStack,
  lineHeight,
  stripFontFamily,
  measureRef,
  pageHeight,
  contentWidth, // NEW — real width, tracked via state so it's reactive
}: {
  blocks: string[];
  fontSize: number;
  fontStack: string;
  lineHeight: number | string;
  stripFontFamily: boolean;
  measureRef: React.RefObject<HTMLDivElement | null>;
  pageHeight: number;
  contentWidth: number;
}) {
  const [pages, setPages] = useState<ReaderPage[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const container = measureRef.current;
    // Bail until we have a real width — don't silently measure at 0/stale width.
    if (!container || pageHeight <= 0 || contentWidth <= 0 || blocks.length === 0) return;

    setReady(false);

    const temp = document.createElement("div");
    temp.style.position = "absolute";
    temp.style.visibility = "hidden";
    temp.style.left = "-9999px";
    temp.style.top = "0";
    temp.style.width = `${contentWidth}px`;
    temp.style.fontSize = `${fontSize}px`;
    temp.style.lineHeight = String(lineHeight);
    if (!stripFontFamily) temp.style.fontFamily = fontStack;
    container.appendChild(temp);

    const heights: number[] = [];
    for (const html of blocks) {
      const wrap = document.createElement("div");
      // Mirror ChapterParagraph's real wrapper exactly — same padding class
      // the actual reader uses, so wrapping matches what's really rendered.
      wrap.className = "prose-block px-8";
      wrap.innerHTML = html;
      temp.appendChild(wrap);
      heights.push(wrap.getBoundingClientRect().height);
      temp.removeChild(wrap);
    }
    container.removeChild(temp);

    const GAP = 20;
    const OVERFLOW_ALLOWANCE = Math.round(fontSize * 3);
    const nextPages: ReaderPage[] = [];
    let current: ReaderPage = [];
    let used = 0;

    for (let i = 0; i < blocks.length; i++) {
      const html = blocks[i];
      const h = heights[i];
      const addition = current.length === 0 ? h : h + GAP;

      // Fits normally
      if (
        used + addition <= pageHeight + OVERFLOW_ALLOWANCE ||
        current.length === 0
      ) {
        current.push({
          paragraphIndex: i,
          html,
          isContinuation: false,
        });

        used += addition;
        continue;
      }

      // Doesn't fit — try splitting into sentences
      const sentences = splitIntoSentences(html);

      // Too short to split? Move it whole.
      if (sentences.length <= 1) {
        nextPages.push(current);

        current = [{
          paragraphIndex: i,
          html,
          isContinuation: false,
        }];

        used = h;
        continue;
      }

      // Binary search for the largest chunk of sentences that fits.
          let low = 1;
          let high = sentences.length;
          let best = 0;

          while (low <= high) {
            const mid = Math.floor((low + high) / 2);

            const candidateHtml = `<p>${sentences
              .slice(0, mid)
              .join(" ")}</p>`;

            const candidateHeight = measureHtmlHeight(temp, candidateHtml);

            const candidateAddition =
              current.length === 0
                ? candidateHeight
                : candidateHeight + GAP;

            if (used + candidateAddition <= pageHeight) {
              best = mid;
              low = mid + 1;
            } else {
              high = mid - 1;
            }
          }
          // Nothing fits? Move the whole paragraph.
          if (best === 0) {
            nextPages.push(current);

            current = [{
              paragraphIndex: i,
              html,
              isContinuation: false,
            }];

            used = h;
            continue;
          }


            current.push({
              paragraphIndex: i,
              html,
              isContinuation: false,
            });

            nextPages.push(current);

            const remainderHtml = `<p>${sentences
            .slice(best)
            .join(" ")}</p>`;

          current = [{
            paragraphIndex: i,
            html,
            isContinuation: true,
          }];

          used = measureHtmlHeight(temp, remainderHtml);
    }
    if (current.length > 0) nextPages.push(current);

   setPages(
     nextPages.length > 0
    ? nextPages
    : [
        blocks.map((html, i) => ({
          paragraphIndex: i,
          html,
          isContinuation: false,
        })),
      ]
);
setReady(true);
  }, [blocks, fontSize, fontStack, lineHeight, stripFontFamily, pageHeight, measureRef, contentWidth]);

  return { pages, ready };
}