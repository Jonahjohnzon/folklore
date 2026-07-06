"use client";

import { useState } from "react";
import { X, Check, Lock, Volume2, VolumeX } from "lucide-react";
import type { ChapterPresentation } from "@/lib/chapter-presentation";
import type { ReaderPrefs } from "@/lib/reader-prefs";
import { SHEET_THEMES } from "@/lib/sheet-themes";
import { PLATFORM_SOUNDS, SOUND_CATEGORIES, DEFAULT_PAGE_TURN_SOUND_ID } from "@/lib/sounds";

const FONT_OPTIONS = [
  { id: "serif", label: "Source Serif" },
  { id: "display", label: "Fraunces" },
  { id: "sans", label: "Inter" },
  { id: "mono", label: "Plex Mono" },
];

interface ReaderSettingsModalProps {
  open: boolean;
  presentation: ChapterPresentation;
  authorSoundLabel: string | null;
  currentPrefs: ReaderPrefs | null;
  onSave: (prefs: ReaderPrefs) => void;
  onClose: () => void;
}

export function ReaderSettingsModal({
  open, presentation, authorSoundLabel, currentPrefs, onSave, onClose,
}: ReaderSettingsModalProps) {
  const [mode, setMode] = useState<"author" | "custom">(currentPrefs?.mode ?? "author");
  const [fontId, setFontId] = useState(currentPrefs?.fontId ?? presentation.fontId);
  const [fontSize] = useState(currentPrefs?.fontSize ?? presentation.fontSize);
  const [themeId, setThemeId] = useState(currentPrefs?.themeId ?? SHEET_THEMES[0].id);

  // soundOn = ambient sound on/off. ambientSoundId = which one, when the
  // reader overrides the author's choice. null means "use the author's pick."
  const [soundOn, setSoundOn] = useState(currentPrefs?.soundOn ?? true);
  const [ambientSoundId, setAmbientSoundId] = useState<string | null>(
    currentPrefs?.ambientSoundId ?? null
  );

  // Page-turn is a single fixed sound — plain on/off, not a picker.
  const [pageTurnOn, setPageTurnOn] = useState(
    (currentPrefs?.pageTurnSoundId ?? null) !== null
  );

  if (!open) return null;

  const isFirstRun = !currentPrefs;

  function buildPrefs(): ReaderPrefs {
    return {
      mode,
      fontId,
      fontSize,
      themeId,
      soundOn,
      ambientSoundId,
      pageTurnSoundId: pageTurnOn ? DEFAULT_PAGE_TURN_SOUND_ID : null,
    };
  }

  function handleClose() {
    if (isFirstRun) {
      onSave({
        mode: "author",
        fontId: presentation.fontId,
        fontSize: presentation.fontSize,
        themeId: SHEET_THEMES[0].id,
        soundOn: true,
        ambientSoundId: null,
        pageTurnSoundId: null,
      });
    } else {
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
      <div className="max-h-[85vh] w-full max-w-md overflow-y-auto scrollbar-thin rounded-xl border border-hairline bg-surface p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-ink">
            {isFirstRun ? "How would you like to read?" : "Reading settings"}
          </h3>
          <button onClick={handleClose} className="text-ink-muted hover:text-ink" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => setMode("author")}
            className={`flex items-center justify-between rounded-lg border px-3.5 py-3 text-left transition ${
              mode === "author" ? "border-accent bg-accent/10" : "border-hairline bg-bg hover:border-accent/60"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span
                className="h-6 w-6 shrink-0 rounded-full border"
                style={{ background: presentation.background, borderColor: presentation.borderColor }}
              />
              <div>
                <p className="font-sans text-sm font-semibold text-ink">{"Read the author's way"}</p>
                <p className="mt-0.5 font-sans text-xs text-ink-muted">The author has chosen the font, sheet, and sounds for this chapter.</p>
              </div>
            </div>
            {mode === "author" && <Check size={16} className="shrink-0 text-accent" />}
          </button>

          <button
            onClick={() => setMode("custom")}
            className={`flex items-center justify-between rounded-lg border px-3.5 py-3 text-left transition ${
              mode === "custom" ? "border-accent bg-accent/10" : "border-hairline bg-bg hover:border-accent/60"
            }`}
          >
            <div>
              <p className="font-sans text-sm font-semibold text-ink">Customize my reading</p>
              <p className="mt-0.5 font-sans text-xs text-ink-muted">Your own font, sheet, and sounds, where the author allows it.</p>
            </div>
            {mode === "custom" && <Check size={16} className="shrink-0 text-accent" />}
          </button>
        </div>

        {mode === "custom" && (
          <div className="mt-4 flex flex-col gap-4 border-t border-hairline pt-4">
            <div>
              <p className="font-sans text-xs font-semibold uppercase tracking-wide text-ink-muted">Font</p>
              {presentation.locks.font ? (
                <LockedNote label={presentation.fontFamily} />
              ) : (
                <div className="mt-2 grid grid-cols-2 gap-1.5">
                  {FONT_OPTIONS.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFontId(f.id)}
                      className={`rounded-lg border px-2.5 py-1.5 font-sans text-xs transition ${
                        fontId === f.id ? "border-accent bg-accent/10 text-accent" : "border-hairline text-ink hover:border-accent/60"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <p className="font-sans text-xs font-semibold uppercase tracking-wide text-ink-muted">Sheet</p>
              {presentation.locks.theme ? (
                <LockedNote label="Author's colors" />
              ) : (
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {SHEET_THEMES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setThemeId(t.id)}
                      className={`flex flex-col items-center gap-1 rounded-lg border-2 p-1.5 transition ${
                        themeId === t.id ? "border-accent" : "border-hairline hover:border-accent/60"
                      }`}
                    >
                      <span className="h-8 w-full rounded" style={{ background: t.background, border: `1px solid ${t.borderColor}` }} />
                      <span className="font-sans text-[10px] text-ink-muted">{t.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <p className="font-sans text-xs font-semibold uppercase tracking-wide text-ink-muted">Background sound</p>
              {presentation.locks.sound ? (
                <LockedNote label={authorSoundLabel ? `${authorSoundLabel} (always on)` : "None"} />
              ) : (
                <>
                  <button
                    onClick={() => setSoundOn((s) => !s)}
                    className="mt-2 flex w-full items-center justify-between rounded-lg border border-hairline bg-bg px-3 py-2"
                  >
                    <span className="flex items-center gap-2 font-sans text-sm text-ink">
                      {soundOn ? <Volume2 size={14} /> : <VolumeX size={14} />}
                      {ambientSoundId
                        ? PLATFORM_SOUNDS.find((s) => s.id === ambientSoundId)?.label ?? "Ambient sound"
                        : authorSoundLabel ?? "Ambient sound"}
                    </span>
                    <span className={`rounded-full px-2.5 py-1 font-sans text-xs font-medium ${soundOn ? "bg-accent/10 text-accent" : "bg-hairline/40 text-ink-muted"}`}>
                      {soundOn ? "On" : "Off"}
                    </span>
                  </button>

                  {soundOn && (
                    <div className="mt-2 max-h-48 overflow-y-auto scrollbar-thin rounded-lg border border-hairline bg-bg">
                      <SoundOption
                        label={authorSoundLabel ? `${authorSoundLabel} (author's pick)` : "Author's pick"}
                        selected={ambientSoundId === null}
                        onClick={() => setAmbientSoundId(null)}
                      />
                      {SOUND_CATEGORIES.map((cat) => {
                        const items = PLATFORM_SOUNDS.filter((s) => s.category === cat.id);
                        if (items.length === 0) return null;
                        return (
                          <div key={cat.id}>
                            <p className="border-b border-t border-hairline bg-hairline/10 px-3 py-1 font-sans text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
                              {cat.label}
                            </p>
                            {items.map((s) => (
                              <SoundOption
                                key={s.id}
                                label={s.label}
                                selected={ambientSoundId === s.id}
                                onClick={() => setAmbientSoundId(s.id)}
                              />
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>

            <div>
              <p className="font-sans text-xs font-semibold uppercase tracking-wide text-ink-muted">Page-turn sound</p>
              {presentation.locks.sound ? (
                <LockedNote label="Page turn (always on)" />
              ) : (
                <button
                  onClick={() => setPageTurnOn((p) => !p)}
                  className="mt-2 flex w-full items-center justify-between rounded-lg border border-hairline bg-bg px-3 py-2"
                >
                  <span className="flex items-center gap-2 font-sans text-sm text-ink">
                    {pageTurnOn ? <Volume2 size={14} /> : <VolumeX size={14} />}
                    Page turn
                  </span>
                  <span className={`rounded-full px-2.5 py-1 font-sans text-xs font-medium ${pageTurnOn ? "bg-accent/10 text-accent" : "bg-hairline/40 text-ink-muted"}`}>
                    {pageTurnOn ? "On" : "Off"}
                  </span>
                </button>
              )}
            </div>
          </div>
        )}

        <button
          onClick={() => onSave(buildPrefs())}
          className="mt-5 w-full rounded-full bg-accent py-2.5 font-sans text-sm font-semibold text-accent-ink hover:opacity-90"
        >
          {isFirstRun ? "Start reading" : "Save preferences"}
        </button>
      </div>
    </div>
  );
}

function SoundOption({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <div
      role="option"
      aria-selected={selected}
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className={`flex cursor-pointer items-center justify-between border-b border-hairline px-3 py-2 font-sans text-sm transition last:border-b-0 ${
        selected ? "bg-accent/10 text-accent" : "text-ink hover:bg-hairline/20"
      }`}
    >
      {label}
      {selected && <Check size={14} className="shrink-0 text-accent" />}
    </div>
  );
}

function LockedNote({ label }: { label: string }) {
  return (
    <div className="mt-2 flex items-center gap-1.5 rounded-lg border border-hairline bg-bg px-3 py-2 font-sans text-xs text-ink-muted">
      <Lock size={11} /> {label} — set by the author
    </div>
  );
}