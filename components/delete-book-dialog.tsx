// components/delete-book-dialog.tsx
"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, X } from "lucide-react";
import { BookService } from "@/app/services/BookService";

export function DeleteBookDialog({
  bookId,
  bookTitle,
  onClose,
  onDeleted,
}: {
  bookId: string;
  bookTitle: string;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    try {
      await BookService.remove(bookId);
      onDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't delete this book.");
      setDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-hairline bg-surface p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-red-700">
            <AlertTriangle size={18} /> Delete book
          </h2>
          <button onClick={onClose} aria-label="Close" className="text-ink-muted hover:text-ink">
            <X size={18} />
          </button>
        </div>

        <p className="mt-3 font-sans text-sm text-ink-muted">
          This removes <span className="font-semibold text-ink">{bookTitle}</span> from readers and your
          dashboard. Type the title to confirm.
        </p>

        {error && (
          <div className="mt-3 rounded-lg border border-red-300 bg-red-50 px-3 py-2 font-sans text-sm text-red-700">
            {error}
          </div>
        )}

        <input
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder={bookTitle}
          className="mt-3 w-full rounded-lg border border-hairline bg-bg px-3.5 py-2.5 font-sans text-sm text-ink focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
        />

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-full border border-hairline px-4 py-2 font-sans text-sm font-medium text-ink-muted hover:text-ink"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={confirmText !== bookTitle || deleting}
            className="flex items-center gap-1.5 rounded-full bg-red-600 px-4 py-2 font-sans text-sm font-semibold text-white transition disabled:opacity-40 hover:bg-red-700"
          >
            {deleting && <Loader2 size={14} className="animate-spin" />}
            {deleting ? "Deleting…" : "Delete book"}
          </button>
        </div>
      </div>
    </div>
  );
}