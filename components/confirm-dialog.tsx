"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { TriangleAlert } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Discard",
  cancelLabel = "Keep editing",
  danger = true,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    confirmRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-60 flex items-center justify-center bg-bg/20 px-4 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]"
      onClick={onCancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl border border-hairline bg-surface-raised p-5 shadow-2xl animate-[popIn_0.15s_ease-out]"
      >
        <div className="flex items-start gap-3">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
              danger ? "bg-red-500/10 text-red-500" : "bg-accent/10 text-accent"
            }`}
          >
            <TriangleAlert size={17} />
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <h3 id="confirm-dialog-title" className="font-display text-base font-semibold text-ink">
              {title}
            </h3>
            {description && (
              <p className="mt-1 font-sans text-sm leading-relaxed text-ink-muted">{description}</p>
            )}
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="cursor-pointer rounded-full border border-hairline px-4 py-2 font-sans text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            onClick={onConfirm}
            className={`cursor-pointer rounded-full px-4 py-2 font-sans text-sm font-semibold transition ${
              danger
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-accent text-accent-ink hover:opacity-80"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}