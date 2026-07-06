"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useSnapshot } from "valtio";
import { store } from "@/app/store/userStore";
import { AuthService } from "@/app/services/auth"; // TODO: adjust path to your auth service
import { TextInput } from "./shared";

export function DangerZoneTab({ onAccountDeleted }: { onAccountDeleted: () => void }) {
  const snap = useSnapshot(store);
  const [confirmText, setConfirmText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"deactivate" | "delete" | null>(null);

  const expected = snap.username ?? "";
  const canConfirm = confirmText === expected;

  const handleDeactivate = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await AuthService.deactivateAccount();
      onAccountDeleted();
    } catch {
      setError("Couldn't deactivate your account. Try again.");
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!canConfirm) return;
    setSubmitting(true);
    setError(null);
    try {
      await AuthService.deleteAccount();
      onAccountDeleted();
    } catch {
      setError("Couldn't delete your account. Try again.");
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h3 className="font-display text-xl font-semibold text-ink">Deactivate &amp; delete</h3>
      <p className="mt-1 font-sans text-sm text-ink-muted">These actions affect your entire account. Read carefully.</p>

      {/* Deactivate */}
      <div className="mt-6 rounded-lg border border-hairline p-4">
        <p className="font-sans text-sm font-semibold text-ink">Deactivate account</p>
        <p className="mt-1 font-sans text-xs text-ink-muted">
          Hides your profile and works. Log back in anytime to reactivate — nothing is deleted.
        </p>
        {mode !== "deactivate" ? (
          <button
            onClick={() => setMode("deactivate")}
            className="mt-3 cursor-pointer rounded-full border border-hairline px-4 py-2 font-sans text-xs font-semibold text-ink transition hover:border-accent hover:text-accent"
          >
            Deactivate account
          </button>
        ) : (
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={handleDeactivate}
              disabled={submitting}
              className="flex cursor-pointer items-center gap-1.5 rounded-full bg-ink px-4 py-2 font-sans text-xs font-semibold text-page transition hover:opacity-70 disabled:opacity-50"
            >
              {submitting && <Loader2 size={12} className="animate-spin" />}
              Confirm deactivation
            </button>
            <button
              onClick={() => setMode(null)}
              className="cursor-pointer font-sans text-xs font-semibold text-ink-muted hover:text-ink"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Delete */}
      <div className="mt-4 rounded-lg border border-red-500/40 bg-red-500/5 p-4">
        <p className="font-sans text-sm font-semibold text-red-600">Delete account permanently</p>
        <p className="mt-1 font-sans text-xs text-ink-muted">
          {"Removes your profile, books, chapters, comments, and coins for good. This can't be undone."}
        </p>

        {mode !== "delete" ? (
          <button
            onClick={() => setMode("delete")}
            className="mt-3 cursor-pointer rounded-full border border-red-500 px-4 py-2 font-sans text-xs font-semibold text-red-600 transition hover:bg-red-500 hover:text-white"
          >
            Delete account
          </button>
        ) : (
          <div className="mt-3">
            <p className="font-sans text-xs text-ink-muted">
              Type <span className="font-semibold text-ink">{expected}</span> to confirm.
            </p>
            <TextInput
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={expected}
              className="mt-2 max-w-xs"
            />
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={handleDelete}
                disabled={!canConfirm || submitting}
                className="flex cursor-pointer items-center gap-1.5 rounded-full bg-red-600 px-4 py-2 font-sans text-xs font-semibold text-white transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {submitting && <Loader2 size={12} className="animate-spin" />}
                Permanently delete
              </button>
              <button
                onClick={() => {
                  setMode(null);
                  setConfirmText("");
                }}
                className="cursor-pointer font-sans text-xs font-semibold text-ink-muted hover:text-ink"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {error && <p className="mt-4 font-sans text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
}