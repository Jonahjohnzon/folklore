// lib/reader-pagination.ts
"use client";
import { useEffect, useState } from "react";

export function usePaginatedBlocks({
  blocks,
  fontSize,
  fontStack,
  lineHeight,
  stripFontFamily,
  measureRef,
  pageHeight,
}: {
  blocks: string[];
  fontSize: number;
  fontStack: string;
  lineHeight: number | string;
  stripFontFamily: boolean;
  measureRef: React.RefObject<HTMLDivElement | null>;
  pageHeight: number;
}) {
  const [pages, setPages] = useState<number[][]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const container = measureRef.current;
    if (!container || pageHeight <= 0 || blocks.length === 0) return;

    setReady(false);

    // Render each block into a hidden sandbox at the *real* typography
    // settings so measured heights match what the reader will actually see.
    const temp = document.createElement("div");
    temp.style.position = "absolute";
    temp.style.visibility = "hidden";
    temp.style.left = "-9999px";
    temp.style.top = "0";
    temp.style.width = `${container.clientWidth}px`;
    temp.style.fontSize = `${fontSize}px`;
    temp.style.lineHeight = String(lineHeight);
    if (!stripFontFamily) temp.style.fontFamily = fontStack;
    container.appendChild(temp);

    const heights: number[] = [];
    for (const html of blocks) {
      const wrap = document.createElement("div");
      wrap.innerHTML = html;
      temp.appendChild(wrap);
      heights.push(wrap.getBoundingClientRect().height);
      temp.removeChild(wrap);
    }
    container.removeChild(temp);

    // Greedily pack blocks into pages that fit the available height.
    const GAP = 20; // matches paragraph vertical rhythm
    const nextPages: number[][] = [];
    let current: number[] = [];
    let used = 0;

    heights.forEach((h, i) => {
      const addition = current.length === 0 ? h : h + GAP;
      if (used + addition > pageHeight && current.length > 0) {
        nextPages.push(current);
        current = [i];
        used = h;
      } else {
        current.push(i);
        used += addition;
      }
    });
    if (current.length > 0) nextPages.push(current);

    setPages(nextPages.length > 0 ? nextPages : [blocks.map((_, i) => i)]);
    setReady(true);
  }, [blocks, fontSize, fontStack, lineHeight, stripFontFamily, pageHeight, measureRef]);

  return { pages, ready };
}