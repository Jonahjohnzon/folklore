"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Maximize2, X } from "lucide-react";

export const DEFAULT_IMAGE_WIDTH = 280;

type DragMode = "move" | "resize";

/**
 * Manages free-drag/resize images that live as position:absolute children of
 * the contentEditable sheet. Returns handlers to wire into the editor plus
 * the currently-selected image element as STATE (not a ref read during render
 * — reading ref.current inside JSX is what was crashing before).
 */
export function useImageLayer(editorRef: React.RefObject<HTMLDivElement>, sheetRef: React.RefObject<HTMLDivElement>, onContentChange: () => void) {
  const [activeImage, setActiveImage] = useState<HTMLElement | null>(null);
  const dragState = useRef<{
    mode: DragMode;
    startX: number;
    startY: number;
    startLeft: number;
    startTop: number;
    startWidth: number;
    el: HTMLElement;
  } | null>(null);

  // Make sure the editor always has at least one real flow paragraph to type
  // into. Without this, an editor whose only child is an absolutely-positioned
  // image span has no flow content to click into — clicks just hit the image,
  // which calls preventDefault()/stopPropagation() to start a drag, so the
  // caret never lands and typing appears completely broken.
  const ensureFlowParagraph = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const hasFlowText = Array.from(editor.childNodes).some(
      (n) => !(n instanceof HTMLElement && n.classList.contains("editor-image-wrap"))
    );
    if (!hasFlowText) {
      editor.insertAdjacentHTML("beforeend", "<p><br></p>");
    }
  }, [editorRef]);

  function insertImage(file: File) {
    const editor = editorRef.current;
    if (!editor) return;
    const url = URL.createObjectURL(file);
    const id = `img-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    const sheetRect = sheetRef.current?.getBoundingClientRect();
    const startLeft = sheetRect ? Math.max(16, sheetRect.width / 2 - DEFAULT_IMAGE_WIDTH / 2) : 24;
    const startTop = 24;

    const html = `<span class="editor-image-wrap" data-image-id="${id}" contenteditable="false"
        style="position:absolute;left:${startLeft}px;top:${startTop}px;width:${DEFAULT_IMAGE_WIDTH}px;z-index:5;">
        <img src="${url}" draggable="false" style="width:100%;display:block;border-radius:8px;pointer-events:none;box-shadow:0 1px 4px rgba(0,0,0,0.15);" />
      </span>`;
    editor.insertAdjacentHTML("beforeend", html);
    ensureFlowParagraph();
    onContentChange();

    // Put the caret into the flow paragraph so the user can keep typing right away.
    const lastP = Array.from(editor.querySelectorAll("p")).pop();
    if (lastP) {
      const range = document.createRange();
      range.selectNodeContents(lastP);
      range.collapse(false);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
      editor.focus();
    }
  }

  function selectFromClick(e: React.MouseEvent) {
    const target = e.target as HTMLElement;
    const wrap = target.closest(".editor-image-wrap") as HTMLElement | null;
    setActiveImage(wrap);
  }

  function beginDrag(el: HTMLElement, e: React.MouseEvent, mode: DragMode) {
    e.preventDefault();
    e.stopPropagation();
    setActiveImage(el);
    dragState.current = {
      mode,
      el,
      startX: e.clientX,
      startY: e.clientY,
      startLeft: parseFloat(el.style.left) || 0,
      startTop: parseFloat(el.style.top) || 0,
      startWidth: parseFloat(el.style.width) || DEFAULT_IMAGE_WIDTH,
    };
  }

  function onEditorMouseDown(e: React.MouseEvent) {
    const target = e.target as HTMLElement;
    const wrap = target.closest(".editor-image-wrap") as HTMLElement | null;
    if (wrap) beginDrag(wrap, e, "move");
  }

  function deleteActive() {
    activeImage?.remove();
    setActiveImage(null);
    ensureFlowParagraph();
    onContentChange();
  }

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      const drag = dragState.current;
      const sheet = sheetRef.current;
      if (!drag || !sheet) return;

      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;

      if (drag.mode === "move") {
        const sheetRect = sheet.getBoundingClientRect();
        const w = drag.el.offsetWidth;
        const h = drag.el.offsetHeight;
        let newLeft = drag.startLeft + dx;
        let newTop = drag.startTop + dy;
        newLeft = Math.min(Math.max(newLeft, -w * 0.5), sheetRect.width - w * 0.5);
        newTop = Math.min(Math.max(newTop, 0), Math.max(sheetRect.height - h * 0.5, 0));
        drag.el.style.left = `${newLeft}px`;
        drag.el.style.top = `${newTop}px`;
      } else {
        // Resize only ever happens via the explicit handle drag, never automatically.
        const newWidth = Math.min(Math.max(drag.startWidth + dx, 80), 900);
        drag.el.style.width = `${newWidth}px`;
      }
    }
    function onMouseUp() {
      dragState.current = null;
    }
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [sheetRef]);

  return {
    activeImage,
    insertImage,
    selectFromClick,
    onEditorMouseDown,
    beginDrag,
    deleteActive,
    ensureFlowParagraph,
  };
}

export function ActiveImageToolbar({ onDelete }: { onDelete: () => void }) {
  return (
    <div className="flex items-center gap-2 border-b border-hairline bg-accent/5 px-3 py-1.5">
      <span className="font-sans text-xs font-medium text-ink-muted">
        Image selected — drag to move, corner handle to resize
      </span>
      <button
        onClick={onDelete}
        className="ml-auto flex items-center gap-1 rounded-md px-2 py-1 font-sans text-xs font-medium text-red-600 hover:bg-red-50"
      >
        <X size={13} /> Remove
      </button>
    </div>
  );
}

/** Floating handle pinned to the active image's corner. Receives position via props,
 * computed by the parent from state — never reads a ref during render. */
export function ResizeHandle({
  left, top, width, height, onStart,
}: { left: number; top: number; width: number; height: number; onStart: (e: React.MouseEvent) => void }) {
  return (
    <div
      onMouseDown={onStart}
      className="absolute z-10 flex h-5 w-5 cursor-se-resize items-center justify-center rounded-full border border-accent bg-surface shadow-sm"
      style={{ left: left + width - 10, top: top + height - 10 }}
      aria-label="Resize image"
    >
      <Maximize2 size={10} className="text-accent" />
    </div>
  );
}