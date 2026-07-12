// components/editor/SoundPickerModal.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, X, Loader2 } from "lucide-react";
import { SOUND_CATEGORIES, type PlatformSound } from "@/lib/sounds";
import { SoundService } from "@/app/services/SoundService";

interface SoundPickerModalProps {
  open: boolean;
  selectedSoundId: string | null;
  onSelect: (id: string) => void;
  onClose: () => void;
}

export default function SoundPickerModal({ open, selectedSoundId, onSelect, onClose }: SoundPickerModalProps) {
  const [sounds, setSounds] = useState<PlatformSound[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    SoundService.list()
      .then((res) => setSounds(res.data.sounds))
      .catch((err) => setError(err instanceof Error ? err.message : "Couldn't load sounds."))
      .finally(() => setLoading(false));
  }, [open]);

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

        {loading && (
          <div className="flex items-center gap-2 py-6 font-sans text-sm text-ink-muted">
            <Loader2 size={14} className="animate-spin" /> Loading sounds…
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-3.5 py-2 font-sans text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading &&
          !error &&
          SOUND_CATEGORIES.map((cat) => {
            const inCategory = sounds.filter((s) => s.category === cat.id);
            if (!inCategory.length) return null;
            return (
              <div key={cat.id} className="mb-4">
                <h4 className="font-sans text-xs font-semibold uppercase tracking-wide text-ink-muted">
                  {cat.label}
                </h4>
                <div className="mt-2 flex flex-col gap-1.5">
                  {inCategory.map((s) => (
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
            );
          })}
      </div>
    </div>
  );
}