"use client";

import { useRef, useState } from "react";
import { Play, Pause, X } from "lucide-react";
import { PLATFORM_SOUNDS, SOUND_CATEGORIES, type PlatformSound } from "@/lib/sounds";

interface SoundPickerModalProps {
  open: boolean;
  selectedSoundId: string | null;
  onSelect: (id: string) => void;
  onClose: () => void;
}

export default function SoundPickerModal({ open, selectedSoundId, onSelect, onClose }: SoundPickerModalProps) {
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  if (!open) return null;

  function toggleSoundPreview(sound: PlatformSound) {
    if (previewingId === sound.id) {
      audioRef.current?.pause();
      setPreviewingId(null);
      return;
    }
    if (audioRef.current) {
      audioRef.current.src = sound.url;
      audioRef.current.play().catch(() => {});
    }
    setPreviewingId(sound.id);
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 px-4">
      <audio ref={audioRef} onEnded={() => setPreviewingId(null)} className="hidden" />
      <div className="max-h-[80vh] w-full max-w-lg scrollbar-thin overflow-y-auto rounded-xl border border-hairline bg-surface p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-ink">Choose a sound</h3>
          <button onClick={onClose} className="text-ink-muted hover:text-ink">
            <X size={18} />
          </button>
        </div>

        {SOUND_CATEGORIES.map((cat) => (
          <div key={cat.id} className="mb-4">
            <h4 className="font-sans text-xs font-semibold uppercase tracking-wide text-ink-muted">{cat.label}</h4>
            <div className="mt-2 flex flex-col gap-1.5">
              {PLATFORM_SOUNDS.filter((s) => s.category === cat.id).map((s) => (
                <div
                  key={s.id}
                  className={`flex items-center justify-between rounded-lg border bg-bg px-3 py-2 ${
                    selectedSoundId === s.id ? "border-accent" : "border-hairline"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleSoundPreview(s)}
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-hairline text-ink-muted hover:text-ink"
                      aria-label={previewingId === s.id ? "Pause preview" : "Play preview"}
                    >
                      {previewingId === s.id ? <Pause size={12} /> : <Play size={12} />}
                    </button>
                    <span className="font-sans text-sm text-ink">{s.label}</span>
                  </div>
                  <button
                    onClick={() => {
                      onSelect(s.id);
                      onClose();
                    }}
                    className="rounded-full border border-hairline bg-surface px-3 py-1 font-sans text-xs font-medium text-ink hover:border-accent"
                  >
                    {selectedSoundId === s.id ? "Selected" : "Select"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}