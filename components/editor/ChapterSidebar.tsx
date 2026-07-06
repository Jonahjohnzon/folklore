"use client";

import { useRef } from "react";
import { Coins, Music, X, Lock, Unlock, ImagePlus } from "lucide-react";
import type { ChapterAccess } from "@/lib/types";
import { PLATFORM_SOUNDS } from "@/lib/sounds";
import { SHEET_THEMES } from "@/lib/sheet-themes";
import type {CreatorLocks} from "@/lib/chapter-presentation";


interface ChapterSidebarProps {
  access: ChapterAccess;
  onAccessChange: (a: ChapterAccess) => void;
  coins: number;
  onCoinsChange: (n: number) => void;
  selectedSoundId: string | null;
  onClearSound: () => void;
  onOpenSoundPicker: () => void;
  sheetThemeId: string;
  locks: CreatorLocks;
  onLocksChange: (locks: CreatorLocks) => void;
  coverPreview: string | null;
  onCoverSelect: (file: File) => void;
  onRemoveCover: () => void;
  onSheetThemeChange: (id: string) => void;

}

export default function ChapterSidebar({
  access, onAccessChange, coins, onCoinsChange,
  selectedSoundId, onClearSound, onOpenSoundPicker,
  sheetThemeId, onSheetThemeChange, locks, onLocksChange,
  coverPreview, onCoverSelect, onRemoveCover,
}: ChapterSidebarProps) {
  const selectedSound = PLATFORM_SOUNDS.find((s) => s.id === selectedSoundId) ?? null;
  const coverInputRef = useRef<HTMLInputElement>(null);

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onCoverSelect(file);
    e.target.value = "";
  }

  return (
    <aside className="flex flex-col gap-4">
      <div className="rounded-xl border border-hairline bg-surface p-4 shadow-sm">
        <h2 className="font-sans text-sm font-semibold text-ink">Access</h2>
        <div className="mt-3 flex flex-col gap-2">
          {(["free", "coins", "subscriber_only"] as ChapterAccess[]).map((a) => (
            <label
              key={a}
              className="flex cursor-pointer items-center justify-between rounded-lg border border-hairline bg-bg px-3 py-2 text-sm transition has-checked:border-accent has-checked:bg-accent/10"
            >
              <span className="font-sans capitalize text-ink">{a.replace("_", " ")}</span>
              <input
                type="radio"
                name="access"
                checked={access === a}
                onChange={() => onAccessChange(a)}
                className="accent-accent"
              />
            </label>
          ))}
        </div>

        {access === "coins" && (
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-hairline bg-bg px-3 py-2">
            <Coins size={14} className="text-gold" />
            <input
              type="number"
              value={coins}
              onChange={(e) => onCoinsChange(Number(e.target.value))}
              className="w-full bg-transparent font-sans text-sm text-ink focus:outline-none"
            />
            <span className="font-sans text-xs text-ink-muted">coins</span>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-hairline bg-surface p-4 shadow-sm">
        <div className="flex flex-col justify-between">
          <h2 className="flex items-center mb-2 gap-1.5 font-sans text-sm font-semibold text-ink">
            <Music size={14} className="text-accent" /> Sound experience
          </h2>
          <button 
            onClick={() => onLocksChange({ ...locks, sound: !locks.sound })}
            aria-pressed={locks.sound}
            className={`flex items-center cursor-pointer mb-2 gap-1 rounded-full border px-2 py-1 font-sans text-[11px] ${
              locks.sound ? "border-accent bg-accent/10 text-accent" : "border-hairline text-ink-muted"
            }`}
          >
            {locks.sound ? <Lock size={11} /> : <Unlock size={11} />}
            {locks.sound ? "Locked" : "Reader can turn off"}
          </button>
        </div>
        <p className="mt-1 font-sans text-xs text-ink-muted">
          Plays when readers open this chapter. Choose from our licensed library.
        </p>

        {selectedSound && (
          <div className="mt-3 flex items-center justify-between rounded-lg border border-hairline bg-bg px-3 py-2">
            <span className="font-sans text-sm text-ink">{selectedSound.label}</span>
            <button onClick={onClearSound} className="text-ink-muted hover:text-ink" aria-label="Remove sound">
              <X size={14} />
            </button>
          </div>
        )}

        <button
          onClick={onOpenSoundPicker}
          className="mt-3 w-full rounded-lg border-2 border-dashed border-ink-muted/30 bg-bg py-2.5 font-sans text-xs font-medium text-ink-muted transition hover:border-accent hover:text-accent"
        >
          {selectedSound ? "Change sound" : "+ Choose entry sound"}
        </button>
      </div>

      <div className="rounded-xl border border-hairline bg-surface p-4 shadow-sm">
        <h2 className="font-sans text-sm font-semibold text-ink">Sheet style</h2>
        <p className="mt-1 font-sans text-xs text-ink-muted">The paper background behind your writing.</p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {SHEET_THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => onSheetThemeChange(t.id)}
              className={`flex flex-col items-center gap-1 rounded-lg border-2 p-1.5 transition ${
                sheetThemeId === t.id ? "border-accent" : "border-hairline hover:border-accent/60"
              }`}
            >
              <span className="h-9 w-full rounded" style={{ background: t.background, border: `1px solid ${t.borderColor}` }} />
              <span className="font-sans text-[10px] text-ink-muted">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-hairline bg-surface p-4 shadow-sm">
        <h2 className="font-sans text-sm font-semibold text-ink">
          Cover <span className="font-normal text-ink-muted">(optional)</span>
        </h2>
        <p className="mt-1 font-sans text-xs text-ink-muted">Shown wherever this chapter is listed.</p>

        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleCoverChange}
        />
        <button
          onClick={() => coverInputRef.current?.click()}
          className="group relative mt-3 flex aspect-2/3 w-full items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-ink-muted/30 bg-bg transition hover:border-accent hover:bg-accent/5"
        >
          {coverPreview ? (
            <img src={coverPreview} alt="Chapter cover preview" className="h-full w-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-2 px-4 text-center">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/10">
                <ImagePlus size={18} className="text-accent" />
              </div>
              <span className="font-sans text-xs font-medium text-ink-muted">+ Upload cover</span>
            </div>
          )}
          <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />
          {coverPreview && (
            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-2.5 py-1 font-sans text-[11px] font-medium text-white opacity-0 transition group-hover:opacity-100">
              Change cover
            </span>
          )}
        </button>

        {coverPreview && (
          <button
            onClick={onRemoveCover}
            className="mt-2 w-full rounded-lg border border-hairline bg-bg py-1.5 font-sans text-xs font-medium text-ink-muted transition hover:border-red-300 hover:text-red-600"
          >
            Remove cover
          </button>
        )}
      </div>
    </aside>
  );
}