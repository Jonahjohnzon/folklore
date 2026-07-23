// components/reader-content-sheet.tsx
"use client";

import React, { CSSProperties } from "react";
import { ChapterParagraph } from "@/components/chapter-paragraph";
import { SheetOpeningRule, SHEET_PADDING, SHEET_RADIUS } from "@/lib/sheet-surface";

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
  highlightIndex?: number | null;
}

function ReaderContentSheetComponent({
  blocks, commentCounts, stripFontFamily, fontStack, fontSize, lineHeight, ruleColor, surfaceStyle, onOpenComments,
  highlightIndex,
}: ReaderContentSheetProps) {
  return (
    <div
      className={`prose-reader relative mt-10 border text-ink ${SHEET_RADIUS} ${SHEET_PADDING}`}
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
          highlighted={highlightIndex === i}
        />
      ))}
    </div>
  );
}

export const ReaderContentSheet = React.memo(ReaderContentSheetComponent);