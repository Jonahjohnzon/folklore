/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "nextjs-toploader/app";
import { Coins, X, Loader2, AlertTriangle } from "lucide-react";
import { ChapterService } from "@/app/services/ChapterService";

interface Props {
   bookSlug: string;
  chapterId: string;
  chapterTitle: string;
  coinsRequired: number;
  currentBalance: number | null;
  onClose: () => void;
  onUnlocked: (newBalance: number | null) => void;
}

export default function ChapterUnlockModal({
  bookSlug, chapterId, chapterTitle, coinsRequired, currentBalance, onClose, onUnlocked,
}: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const insufficient = currentBalance !== null && currentBalance < coinsRequired;

  async function handleConfirm() {
 setBusy(true);
  setError(null);
  try {
    const { data } = await ChapterService.unlock(chapterId);
    onUnlocked(data.newBalance);
    router.push(`/book/${bookSlug}/chapter/${chapterId}`);
    } catch (err: any) {
      const status = err?.status ?? err?.response?.status;
      if (status === 402) {
        setError("insufficient");
      } else {
        setError(err?.message ?? "Couldn't unlock this chapter. Try again.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-2xl border border-hairline bg-surface-raised p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gold/15 text-gold">
            <Coins size={20} />
          </div>
          <button onClick={onClose} className="text-ink-muted hover:text-ink">
            <X size={18} />
          </button>
        </div>

        <h3 className="mt-3 font-display text-lg font-semibold text-ink">Unlock this chapter</h3>
        <p className="mt-1 font-sans text-sm text-ink-muted">{chapterTitle}</p>

        <div className="mt-4 flex items-center justify-between rounded-xl border border-hairline bg-surface px-3.5 py-2.5">
          <span className="font-sans text-sm text-ink-muted">Cost</span>
          <span className="flex items-center gap-1 font-sans text-sm font-semibold text-ink">
            <Coins size={14} className="text-gold" /> {coinsRequired.toLocaleString()}
          </span>
        </div>

        {currentBalance !== null && (
          <div className="mt-2 flex items-center justify-between px-1">
            <span className="font-sans text-xs text-ink-muted">Your balance</span>
            <span className="font-sans text-xs font-medium text-ink-muted">{currentBalance.toLocaleString()} coins</span>
          </div>
        )}

        {(insufficient || error === "insufficient") ? (
          <div className="mt-4 rounded-xl border border-gold/30 bg-gold/10 px-3.5 py-3">
            <p className="flex items-center gap-1.5 font-sans text-sm font-medium text-ink">
              <AlertTriangle size={14} className="text-gold" /> Not enough coins
            </p>
            <p className="mt-1 font-sans text-xs text-ink-muted">
              You need {(coinsRequired - (currentBalance ?? 0)).toLocaleString()} more coins to unlock this chapter.
            </p>
            <Link
              href="/coins"
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-full bg-accent px-4 py-2.5 font-sans text-sm font-semibold text-accent-ink hover:opacity-90"
            >
              <Coins size={14} /> Get more coins
            </Link>
          </div>
        ) : (
          <>
            {error && <p className="mt-3 font-sans text-xs text-red-600">{error}</p>}
            <button
              onClick={handleConfirm}
              disabled={busy || currentBalance === null}
              className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-full bg-accent px-4 py-2.5 font-sans text-sm font-semibold text-accent-ink hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? <Loader2 size={14} className="animate-spin" /> : <Coins size={14} />}
              {busy ? "Unlocking…" : `Unlock for ${coinsRequired.toLocaleString()} coins`}
            </button>
          </>
        )}
      </div>
    </div>
  );
}