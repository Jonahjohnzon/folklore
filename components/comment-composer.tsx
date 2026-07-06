"use client";

import { useState } from "react";
import { Send } from "lucide-react";

export function CommentComposer({
  onSubmit,
  placeholder = "Add a comment…",
  autoFocus = false,
  submitLabel = "Post",
  onCancel,
}: {
  onSubmit: (content: string) => Promise<void>;
  placeholder?: string;
  autoFocus?: boolean;
  submitLabel?: string;
  onCancel?: () => void;
}) {
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    const trimmed = value.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(trimmed);
      setValue("");
    } catch {
      setError("Couldn't post that — try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        rows={2}
        maxLength={2000}
        className="w-full resize-none rounded-lg border border-hairline bg-surface px-3 py-2 font-sans text-sm text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none"
      />
      <div className="flex items-center justify-between gap-2">
        <span className="font-sans text-xs text-red-500">{error}</span>
        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              onClick={onCancel}
              className="rounded-full px-3 py-1.5 font-sans text-xs font-medium text-ink-muted hover:text-ink"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleSubmit}
            disabled={!value.trim() || submitting}
            className="flex items-center gap-1.5 rounded-full bg-accent px-3.5 py-1.5 font-sans text-xs font-semibold text-accent-ink transition hover:opacity-90 disabled:opacity-50"
          >
            <Send size={12} /> {submitting ? "Posting…" : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}