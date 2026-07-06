"use client";

import { useRef, useState, useEffect } from "react";
import { Maximize2, X } from "lucide-react";

export interface EditorImage {
  id: string;
  src: string;
  left: number;
  top: number;
  width: number;
}

export const DEFAULT_IMAGE_WIDTH = 280;

interface ImageLayerProps {
  images: EditorImage[];
  sheetRef: React.RefObject<HTMLDivElement | null>;
  onChange: (images: EditorImage[]) => void;
}

export default function ImageLayer({ images, sheetRef, onChange }: ImageLayerProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const wrapRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const suppressNextClickRef = useRef(false);

  const dragState = useRef<{
    id: string;
    mode: "move" | "resize";
    startX: number;
    startY: number;
    startLeft: number;
    startTop: number;
    startWidth: number;
  } | null>(null);

  function beginDrag(e: React.MouseEvent, id: string, mode: "move" | "resize") {
    e.preventDefault();
    e.stopPropagation();
    const img = images.find((i) => i.id === id);
    if (!img) return;
    setActiveId(id);
    dragState.current = {
      id,
      mode,
      startX: e.clientX,
      startY: e.clientY,
      startLeft: img.left,
      startTop: img.top,
      startWidth: img.width,
    };
  }

  // Deselect on a genuine outside click. Right after any drag (move or resize)
  // ends, the mouseup → click sequence can land on an unrelated element (e.g. the
  // sheet, if the cursor drifted off the handle mid-drag), which would otherwise
  // bubble up and deselect mid-interaction. We suppress exactly one click after
  // a drag finishes to avoid that, then resume normal outside-click handling.
  useEffect(() => {
    function onDocClick() {
      if (suppressNextClickRef.current) {
        suppressNextClickRef.current = false;
        return;
      }
      setActiveId(null);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      const drag = dragState.current;
      const sheet = sheetRef.current;
      if (!drag || !sheet) return;
      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;

      onChange(
        images.map((img) => {
          if (img.id !== drag.id) return img;
          if (drag.mode === "move") {
            const sheetRect = sheet.getBoundingClientRect();
            const wrap = wrapRefs.current[img.id];
            const w = wrap?.offsetWidth ?? img.width;
            const h = wrap?.offsetHeight ?? img.width * 1.3;
            let newLeft = drag.startLeft + dx;
            let newTop = drag.startTop + dy;
            newLeft = Math.min(Math.max(newLeft, -w * 0.5), sheetRect.width - w * 0.5);
            newTop = Math.min(Math.max(newTop, 0), Math.max(sheetRect.height - h * 0.5, 0));
            return { ...img, left: newLeft, top: newTop };
          }
          const newWidth = Math.min(Math.max(drag.startWidth + dx, 80), 900);
          return { ...img, width: newWidth };
        })
      );
    }
    function onMouseUp() {
      if (dragState.current) {
        // A drag just ended — the upcoming click (wherever it lands) is a
        // byproduct of releasing the mouse, not a real "click outside."
        suppressNextClickRef.current = true;
      }
      dragState.current = null;
    }
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [images, onChange, sheetRef]);

  function deleteImage(id: string) {
    onChange(images.filter((i) => i.id !== id));
    if (activeId === id) setActiveId(null);
  }

  return (
    <>
      {images.map((img) => (
        <div
          key={img.id}
          ref={(el) => {
            wrapRefs.current[img.id] = el;
          }}
          onMouseDown={(e) => beginDrag(e, img.id, "move")}
          onClick={(e) => {
            e.stopPropagation();
            setActiveId(img.id);
          }}
          className="absolute cursor-grab select-none"
          style={{ left: img.left, top: img.top, width: img.width, zIndex: 5 }}
        >
          <img
            src={img.src}
            draggable={false}
            style={{
              width: "100%",
              display: "block",
              borderRadius: 8,
              pointerEvents: "none",
              boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
            }}
          />
          {activeId === img.id && (
            <>
              <div
                onMouseDown={(e) => {
                  e.stopPropagation();
                  beginDrag(e, img.id, "resize");
                }}
                onClick={(e) => e.stopPropagation()}
                className="absolute -bottom-2.5 -right-2.5 z-10 flex h-5 w-5 cursor-se-resize items-center justify-center rounded-full border border-accent bg-surface shadow-sm"
                aria-label="Resize image"
              >
                <Maximize2 size={10} className="text-accent" />
              </div>
              <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  deleteImage(img.id);
                }}
                className="absolute -top-2.5 -right-2.5 z-10 flex h-5 w-5 items-center justify-center rounded-full border border-hairline bg-surface text-red-600 shadow-sm hover:bg-red-50"
                aria-label="Remove image"
              >
                <X size={10} />
              </button>
            </>
          )}
        </div>
      ))}
    </>
  );
}