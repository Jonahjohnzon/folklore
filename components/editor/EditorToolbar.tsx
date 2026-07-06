"use client";

import { useRef, useState } from "react";
import type { Editor } from "@tiptap/react";
import {
  Bold, Italic, Underline, Strikethrough, Quote,
  Heading1, Heading2, Heading3, Table as TableIcon, Palette, Type, Highlighter,
  List, ListOrdered, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Undo2, Redo2, Eraser, Minus,
} from "lucide-react";
import { FONTS } from "./Fonts";

const FONT_SIZES = [
  { label: "Small", value: "13px" },
  { label: "Normal", value: "16px" },
  { label: "Large", value: "20px" },
  { label: "X-Large", value: "28px" },
  { label: "XX-Large", value: "36px" },
];

const TEXT_COLORS = [
  "#1A1A1A", "#404040", "#737373", "#FFFFFF",
  "#DC2626", "#EA580C", "#D97706", "#CA8A04",
  "#65A30D", "#059669", "#0D9488", "#0891B2",
  "#2563EB", "#4F46E5", "#7C3AED", "#C026D3",
  "#DB2777", "#9F1239", "#78350F", "#1E293B",
];

const HIGHLIGHT_COLORS = [
  "#FEF08A", "#FED7AA", "#FECACA",
  "#BBF7D0", "#BFDBFE", "#DDD6FE", "#FBCFE8",
  "#E5E7EB", "#FDE68A",
];

interface EditorToolbarProps {
  editor: Editor | null;
  onInsertTable: () => void;
  wordCount: number;
}

export default function EditorToolbar({ editor, onInsertTable, wordCount }: EditorToolbarProps) {
  if (!editor) return null;

  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 border-b border-hairline bg-surface/95 px-3 py-2 backdrop-blur">
      <ToolbarButton label="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
        <Undo2 size={15} />
      </ToolbarButton>
      <ToolbarButton label="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
        <Redo2 size={15} />
      </ToolbarButton>
      <Divider />

      <ToolbarButton label="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
        <Bold size={15} />
      </ToolbarButton>
      <ToolbarButton label="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <Italic size={15} />
      </ToolbarButton>
      <ToolbarButton label="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
        <Underline size={15} />
      </ToolbarButton>
      <ToolbarButton label="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
        <Strikethrough size={15} />
      </ToolbarButton>
      <Divider />

      <ToolbarButton label="Heading 1" active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
        <Heading1 size={15} />
      </ToolbarButton>
      <ToolbarButton label="Heading 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        <Heading2 size={15} />
      </ToolbarButton>
      <ToolbarButton label="Heading 3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        <Heading3 size={15} />
      </ToolbarButton>
      <ToolbarButton label="Quote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        <Quote size={15} />
      </ToolbarButton>
      <Divider />

      <ToolbarButton label="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        <List size={15} />
      </ToolbarButton>
      <ToolbarButton label="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        <ListOrdered size={15} />
      </ToolbarButton>
      <Divider />

      <ToolbarButton label="Align left" active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()}>
        <AlignLeft size={15} />
      </ToolbarButton>
      <ToolbarButton label="Align center" active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()}>
        <AlignCenter size={15} />
      </ToolbarButton>
      <ToolbarButton label="Align right" active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()}>
        <AlignRight size={15} />
      </ToolbarButton>
      <ToolbarButton label="Justify" active={editor.isActive({ textAlign: "justify" })} onClick={() => editor.chain().focus().setTextAlign("justify").run()}>
        <AlignJustify size={15} />
      </ToolbarButton>
      <Divider />

      <ColorControl
        label="Text color"
        icon={<Palette size={15} />}
        swatches={TEXT_COLORS}
        allowNone={false}
        onApply={(color) => editor.chain().focus().setColor(color).run()}
      />
      <ColorControl
        label="Highlight"
        icon={<Highlighter size={15} />}
        swatches={HIGHLIGHT_COLORS}
        allowNone
        onApply={(color) =>
          color === "none"
            ? editor.chain().focus().unsetHighlight().run()
            : editor.chain().focus().toggleHighlight({ color }).run()
        }
      />
      <Divider />

      <div className="relative flex items-center">
        <Type size={14} className="mx-1 text-ink-muted" />
        <select
          onChange={(e) => editor.chain().focus().setFontSize(e.target.value).run()}
          defaultValue="16px"
          className="rounded-md border border-hairline bg-bg px-1.5 py-1 font-sans text-xs text-ink focus:outline-none"
        >
          {FONT_SIZES.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
      </div>

      <select
        onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
        defaultValue=""
        className="max-w-30 rounded-md border border-hairline bg-bg px-1.5 py-1 font-sans text-xs text-ink focus:outline-none"
      >
        <option value="" disabled>Font</option>
        {FONTS.map((f) => (
          <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
            {f.label}
          </option>
        ))}
      </select>
      <Divider />

      <ToolbarButton label="Table" onClick={onInsertTable}>
        <TableIcon size={15} />
      </ToolbarButton>
      <ToolbarButton label="Scene break" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        <Minus size={15} />
      </ToolbarButton>
      <ToolbarButton
        label="Clear formatting"
        onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
      >
        <Eraser size={15} />
      </ToolbarButton>

      <div className="ml-auto font-mono text-xs text-ink-muted">{wordCount} words</div>
    </div>
  );
}

function ToolbarButton({
  label, onClick, children, active, disabled,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`flex h-8 w-8 items-center justify-center rounded-md transition disabled:cursor-not-allowed disabled:opacity-30 ${
        active ? "bg-accent/15 text-accent" : "text-ink-muted hover:bg-bg hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="mx-1 h-5 w-px bg-hairline" />;
}

function ColorControl({
  label, icon, swatches, allowNone, onApply,
}: {
  label: string;
  icon: React.ReactNode;
  swatches: string[];
  allowNone?: boolean;
  onApply: (color: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const nativeRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative">
      <ToolbarButton label={label} onClick={() => setOpen((v) => !v)}>
        {icon}
      </ToolbarButton>
      {open && (
        <div className="absolute left-0 top-9 z-20 w-56 rounded-lg border border-hairline bg-surface p-2.5 shadow-lg">
          <div className="grid grid-cols-8 gap-1.5">
            {allowNone && (
              <button
                onClick={() => { onApply("none"); setOpen(false); }}
                className="relative h-6 w-6 rounded-full border border-ink/15 bg-[conic-gradient(from_90deg,transparent_0_90deg,#f87171_90deg_180deg,transparent_180deg_270deg,#f87171_270deg_360deg)]"
                aria-label="No highlight"
                title="None"
              />
            )}
            {swatches.map((c) => (
              <button
                key={c}
                onClick={() => { onApply(c); setOpen(false); }}
                className="h-6 w-6 rounded-full border border-ink/15"
                style={{ backgroundColor: c }}
                aria-label={c}
              />
            ))}
          </div>
          <div className="mt-2 flex items-center gap-2 border-t border-hairline pt-2">
            <input
              ref={nativeRef}
              type="color"
              defaultValue="#1a1a1a"
              onChange={(e) => onApply(e.target.value)}
              className="h-7 w-9 cursor-pointer rounded border border-hairline bg-transparent p-0"
            />
            <span className="font-sans text-xs text-ink-muted">Custom color</span>
          </div>
        </div>
      )}
    </div>
  );
}