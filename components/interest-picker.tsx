// components/interest-picker.tsx
"use client";

import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { OnboardingService, type InterestTag } from "@/app/services/OnboardingService";

const MIN = 3;

export function InterestPicker({ onDone }: { onDone: () => void }) {
  const [tags, setTags] = useState<InterestTag[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    OnboardingService.getOptions()
      .then(({ data }) => setTags(data.tags))
      .finally(() => setLoading(false));
  }, []);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      await OnboardingService.submit([...selected]);
      onDone();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-hairline bg-surface-raised p-6 shadow-2xl">
        <h2 className="font-display text-xl font-semibold text-ink">What do you like to read?</h2>
        <p className="mt-1 font-sans text-sm text-ink-muted">Pick at least {MIN} — we&apos;ll use these to find your next favorite.</p>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 size={20} className="animate-spin text-ink-muted" />
          </div>
        ) : (
          <div className="mt-5 flex flex-wrap gap-2">
            {tags.map((t) => {
              const isSelected = selected.has(t.id);
              return (
                <button
                  key={t.id}
                  onClick={() => toggle(t.id)}
                  className={`flex items-center gap-1.5 rounded-full border px-3.5 py-2 font-sans text-sm font-medium transition ${
                    isSelected
                      ? "border-accent bg-accent text-accent-ink"
                      : "border-hairline text-ink-muted hover:border-accent hover:text-accent"
                  }`}
                >
                  {isSelected && <Check size={13} />} {t.name}
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-6 flex items-center justify-between">
          <button onClick={onDone} className="font-sans text-sm text-ink-muted hover:text-ink">
            Skip for now
          </button>
          <button
            onClick={handleSubmit}
            disabled={selected.size < MIN || submitting}
            className="rounded-full bg-accent px-5 py-2.5 font-sans text-sm font-semibold text-accent-ink transition disabled:opacity-40"
          >
            {submitting ? "Saving…" : `Continue (${selected.size})`}
          </button>
        </div>
      </div>
    </div>
  );
}