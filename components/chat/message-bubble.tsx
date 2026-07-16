// components/chat/message-bubble.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { MoreVertical, Pencil, Trash2, Check, X } from "lucide-react";

export function MessageBubble({
  mine,
  body,
  time,
  deleted,
  edited,
  onEdit,
  onDelete,
}: {
  mine: boolean;
  body: string;
  time: string;
  deleted: boolean;
  edited: boolean;
  onEdit: (newBody: string) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(body);
  const [saving, setSaving] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Message options"
            className="flex h-6 w-6 items-center justify-center rounded-full text-ink-muted opacity-0 transition hover:bg-bg group-hover:opacity-100"
          >
            <MoreVertical size={14} />
          </button>
          {menuOpen && (
            <div className="absolute bottom-full right-0 z-10 mb-1 w-32 overflow-hidden rounded-xl border border-hairline bg-surface shadow-lg">
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
            </div>
          )}
        </div>
      )}

      <div
        className={`max-w-[78%] rounded-2xl px-3.5 py-2 font-sans text-sm leading-relaxed sm:max-w-[65%] ${
          mine ? "rounded-br-md bg-accent text-accent-ink" : "rounded-bl-md border border-hairline bg-surface text-ink"
        }`}
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