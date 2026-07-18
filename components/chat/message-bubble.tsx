// components/chat/message-bubble.tsx
"use client";

import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { MoreVertical, Pencil, Trash2, Check, X, Loader2 } from "lucide-react";

export function MessageBubble({
  mine,
  body,
  time,
  deleted,
  edited,
  deleting = false,
  onEdit,
  onDelete,
}: {
  mine: boolean;
  body: string;
  time: string;
  deleted: boolean;
  edited: boolean;
  deleting?: boolean;
  onEdit: (newBody: string) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number; openUp: boolean } | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(body);
  const [saving, setSaving] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const MENU_WIDTH = 128; // matches w-32
  const MENU_HEIGHT_ESTIMATE = 84; // ~2 items, adjusted after mount if needed

  useLayoutEffect(() => {
    if (!menuOpen || !menuButtonRef.current) return;
    const rect = menuButtonRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < MENU_HEIGHT_ESTIMATE + 8;
    setMenuPos({
      top: openUp ? rect.top - 4 : rect.bottom + 4,
      left: Math.min(rect.right - MENU_WIDTH, window.innerWidth - MENU_WIDTH - 8),
      openUp,
    });
  }, [menuOpen]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (menuRef.current?.contains(target)) return;
      if (dropdownRef.current?.contains(target)) return;
      setMenuOpen(false);
    }
    function handleScroll() {
      setMenuOpen(false);
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // capture:true catches scroll on any ancestor scrollable container, not just window
      window.addEventListener("scroll", handleScroll, true);
      window.addEventListener("resize", handleScroll);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleScroll);
    };
  }, [menuOpen]);

  async function handleSaveEdit() {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === body) {
      setEditing(false);
      setDraft(body);
      return;
    }
    setSaving(true);
    try {
      await onEdit(trimmed);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  if (deleted) {
    return (
      <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
        <div className="max-w-[78%] rounded-2xl border border-dashed border-hairline px-3.5 py-2 font-sans text-xs italic text-ink-muted sm:max-w-[65%]">
          This message was deleted
        </div>
      </div>
    );
  }

  return (
    <div className={`group flex items-center gap-1 ${mine ? "justify-end" : "justify-start"}`}>
      {mine && !editing && (
        <div ref={menuRef} className="relative">
          <button
            ref={menuButtonRef}
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={deleting ? "Deleting message…" : "Message options"}
            disabled={deleting}
            className="flex h-6 w-6 items-center justify-center rounded-full text-ink-muted opacity-0 transition hover:bg-bg group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-100"
          >
            {deleting ? <Loader2 size={14} className="animate-spin" /> : <MoreVertical size={14} />}
          </button>
          {menuOpen &&
            !deleting &&
            menuPos &&
            createPortal(
              <div
                ref={dropdownRef}
                style={{
                  position: "fixed",
                  top: menuPos.openUp ? undefined : menuPos.top,
                  bottom: menuPos.openUp ? window.innerHeight - menuPos.top : undefined,
                  left: menuPos.left,
                  width: MENU_WIDTH,
                }}
                className="z-50 overflow-hidden rounded-xl border border-hairline bg-surface shadow-lg"
              >
                <button
                  onClick={() => {
                    setEditing(true);
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 font-sans text-xs text-ink transition hover:bg-bg"
                >
                  <Pencil size={12} /> Edit
                </button>
                <button
                  onClick={() => {
                    onDelete();
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 font-sans text-xs text-red-600 transition hover:bg-red-50"
                >
                  <Trash2 size={12} /> Delete
                </button>
              </div>,
              document.body
            )}
        </div>
      )}

      <div
        className={`max-w-[78%] rounded-2xl px-3.5 py-2 font-sans text-sm leading-relaxed transition-opacity sm:max-w-[65%] ${
          mine ? "rounded-br-md bg-accent text-accent-ink" : "rounded-bl-md border border-hairline bg-surface text-ink"
        } ${deleting ? "opacity-50" : "opacity-100"}`}
      >
        {editing ? (
          <div className="flex flex-col gap-1.5">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSaveEdit();
                }
                if (e.key === "Escape") {
                  setEditing(false);
                  setDraft(body);
                }
              }}
              autoFocus
              rows={2}
              className="w-full resize-none rounded-lg border border-white/30 bg-black/10 px-2 py-1 font-sans text-sm outline-none"
            />
            <div className="flex justify-end gap-1">
              <button
                onClick={() => {
                  setEditing(false);
                  setDraft(body);
                }}
                className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-black/10"
              >
                <X size={13} />
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-black/10 disabled:opacity-50"
              >
                <Check size={13} />
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="whitespace-pre-wrap wrap-break-word">{body}</p>
            <span className={`mt-1 flex items-center justify-end gap-1 font-sans text-[10px] ${mine ? "text-accent-ink/70" : "text-ink-muted"}`}>
              {edited && <span className="italic">edited</span>}
              {time}
            </span>
          </>
        )}
      </div>
    </div>
  );
}