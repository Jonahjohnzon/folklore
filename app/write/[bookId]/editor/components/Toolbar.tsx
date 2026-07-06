"use client";

import {
  Bold, Italic, Underline, Quote, Link2, Image as ImageIcon,
  Heading1, Heading2, Heading3, Table as TableIcon, Palette, Type,
} from "lucide-react";

export const FONT_SIZES = [
  { label: "Small", value: "2" },
  { label: "Normal", value: "3" },
  { label: "Large", value: "5" },
  { label: "X-Large", value: "6" },
];

export const TEXT_COLORS = [
  "#1A1A1A", "#8B5CF6", "#DC2626", "#059669", "#2563EB", "#D97706", "#FFFFFF",
];

export function ToolbarButton({
  label, onClick, children,
}: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onMouseDown={(e) => e.preventDefault()} // keep editor selection on click
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-md text-ink-muted transition hover:bg-bg hover:text-ink"
    >
      {children}
    </button>
  );
}

export function Divider() {
  return <div className="mx-1 h-5 w-px bg-hairline" />;
}

export function EditorToolbar({
  onExec,
  onInsertLink,
  onInsertTable,
  onPickImage,
  wordCount,
  colorPickerOpen,
  onToggleColorPicker,
}: {
  onExec: (command: string, value?: string) => void;
  onInsertLink: () => void;
  onInsertTable: () => void;
  onPickImage: () => void;
  wordCount: number;
  colorPickerOpen: boolean;
  onToggleColorPicker: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-hairline bg-bg/60 px-3 py-2">
      <ToolbarButton label="Bold" onClick={() => onExec("bold")}><Bold size={15} /></ToolbarButton>
      <ToolbarButton label="Italic" onClick={() => onExec("italic")}><Italic size={15} /></ToolbarButton>
      <ToolbarButton label="Underline" onClick={() => onExec("underline")}><Underline size={15} /></ToolbarButton>
      <Divider />
      <ToolbarButton label="Heading 1" onClick={() => onExec("formatBlock", "<h1>")}><Heading1 size={15} /></ToolbarButton>
      <ToolbarButton label="Heading 2" onClick={() => onExec("formatBlock", "<h2>")}><Heading2 size={15} /></ToolbarButton>
      <ToolbarButton label="Heading 3" onClick={() => onExec("formatBlock", "<h3>")}><Heading3 size={15} /></ToolbarButton>
      <ToolbarButton label="Quote" onClick={() => onExec("formatBlock", "<blockquote>")}><Quote size={15} /></ToolbarButton>
      <Divider />

      <div className="relative">
        <ToolbarButton label="Text color" onClick={onToggleColorPicker}>
          <Palette size={15} />
        </ToolbarButton>
        {colorPickerOpen && (
          <div className="absolute left-0 top-9 z-20 flex gap-1.5 rounded-lg border border-hairline bg-surface p-2 shadow-lg">
            {TEXT_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => onExec("foreColor", c)}
                className="h-6 w-6 rounded-full border border-ink/15"
                style={{ backgroundColor: c }}
                aria-label={c}
              />
            ))}
          </div>
        )}
      </div>

      <div className="relative flex items-center">
        <Type size={14} className="mx-1 text-ink-muted" />
        <select
          onChange={(e) => onExec("fontSize", e.target.value)}
          defaultValue="3"
          className="rounded-md border border-hairline bg-bg px-1.5 py-1 font-sans text-xs text-ink focus:outline-none"
        >
          {FONT_SIZES.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
      </div>
      <Divider />

      <ToolbarButton label="Link" onClick={onInsertLink}><Link2 size={15} /></ToolbarButton>
      <ToolbarButton label="Image" onClick={onPickImage}><ImageIcon size={15} /></ToolbarButton>
      <ToolbarButton label="Table" onClick={onInsertTable}><TableIcon size={15} /></ToolbarButton>

      <div className="ml-auto font-mono text-xs text-ink-muted">{wordCount} words</div>
    </div>
  );
}