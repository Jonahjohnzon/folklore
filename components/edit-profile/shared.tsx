"use client";

import { type ReactNode } from "react";
import { Loader2, Check, TriangleAlert } from "lucide-react";

export function FieldLabel({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <div className="mb-1.5">
      <label className="font-sans text-sm font-semibold text-ink">{children}</label>
      {hint && <p className="mt-0.5 font-sans text-xs text-ink-muted">{hint}</p>}
    </div>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className = "", ...rest } = props;
  return (
    <input
      {...rest}
      className={`w-full rounded-lg border border-hairline bg-page px-3.5 py-2.5 font-sans text-sm text-ink outline-none transition placeholder:text-ink-muted/60 focus:border-accent ${className}`}
    />
  );
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className = "", ...rest } = props;
  return (
    <textarea
      {...rest}
      className={`w-full resize-none rounded-lg border border-hairline bg-page px-3.5 py-2.5 font-sans text-sm text-ink outline-none transition placeholder:text-ink-muted/60 focus:border-accent ${className}`}
    />
  );
}

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export function SaveBar({
  status,
  errorMessage,
  onSave,
  disabled,
}: {
  status: SaveStatus;
  errorMessage?: string | null;
  onSave: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="mt-8 flex items-center gap-3 border-t border-hairline pt-5">
      <button
        onClick={onSave}
        disabled={disabled || status === "saving"}
        className="flex cursor-pointer items-center gap-2 rounded-full bg-accent px-5 py-2.5 font-sans text-sm font-semibold text-accent-ink transition hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {status === "saving" && <Loader2 size={14} className="animate-spin" />}
        Save changes
      </button>

      {status === "saved" && (
        <span className="flex items-center gap-1.5 font-sans text-xs font-medium text-green-600">
          <Check size={14} /> Saved
        </span>
      )}
      {status === "error" && (
        <span className="flex items-center gap-1.5 font-sans text-xs font-medium text-red-500">
          <TriangleAlert size={14} /> {errorMessage || "Something went wrong. Try again."}
        </span>
      )}
    </div>
  );
}