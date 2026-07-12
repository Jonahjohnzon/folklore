// app/admin/sounds/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, Trash2, Plus } from "lucide-react";
import {
  AdminService,
  type AdminSoundRow,
  type SoundCategory,
} from "@/app/services/AdminService";

const CATEGORIES: { id: SoundCategory; label: string }[] = [
  { id: "impact", label: "Impact" },
  { id: "ambience", label: "Ambience" },
  { id: "nature", label: "Nature" },
  { id: "music_sting", label: "Music sting" },
];

const EMPTY_FORM = {
  label: "",
  category: "ambience" as SoundCategory,
  url: "",
};

export default function AdminSoundsPage() {
  const [sounds, setSounds] = useState<AdminSoundRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [creating, setCreating] = useState(false);

  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  function load() {
    setLoading(true);
    AdminService.getSounds()
      .then((res) => setSounds(res.data.sounds))
      .catch((err) => setError(err instanceof Error ? err.message : "Couldn't load sounds."))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function togglePreview(sound: AdminSoundRow) {
    if (previewingId === sound._id) {
      audioRef.current?.pause();
      setPreviewingId(null);
      return;
    }
    if (audioRef.current) {
      audioRef.current.src = sound.url;
      audioRef.current.play().catch(() => {});
    }
    setPreviewingId(sound._id);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.label.trim() || !form.url.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const { data } = await AdminService.createSound({
        label: form.label.trim(),
        category: form.category,
        url: form.url.trim(),
      });
      setSounds((prev) => [data.sound, ...prev]);
      setForm(EMPTY_FORM);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't create the sound.");
    } finally {
      setCreating(false);
    }
  }

  async function handleToggleActive(sound: AdminSoundRow) {
    const prev = sounds;
    setSounds((s) => s.map((row) => (row._id === sound._id ? { ...row, active: !row.active } : row)));
    try {
      await AdminService.updateSound(sound._id, { active: !sound.active });
    } catch {
      setSounds(prev);
    }
  }

  async function handleDelete(soundId: string) {
    if (!confirm("Delete this sound? Chapters currently using it will lose the reference.")) return;
    const prev = sounds;
    setSounds((s) => s.filter((row) => row._id !== soundId));
    try {
      await AdminService.deleteSound(soundId);
    } catch (err) {
      setSounds(prev);
      setError(err instanceof Error ? err.message : "Couldn't delete the sound.");
    }
  }

  return (
    <div>
      <audio ref={audioRef} onEnded={() => setPreviewingId(null)} className="hidden" />

      <h1 className="font-display text-2xl font-semibold text-ink">Sounds</h1>
      <p className="mt-1 font-sans text-sm text-ink-muted">
        Manage the sound library creators can attach to chapters. Ambient sounds loop until the reader pauses or leaves the chapter.
      </p>

      <form
        onSubmit={handleCreate}
        className="mt-6 flex flex-wrap items-end gap-3 rounded-xl border border-hairline bg-surface p-4"
      >
        <div className="flex flex-col gap-1">
          <label className="font-sans text-xs text-ink-muted">Label</label>
          <input
            value={form.label}
            onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
            placeholder="e.g. Distant thunder"
            className="w-44 rounded-lg border border-hairline px-3 py-1.5 font-sans text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-sans text-xs text-ink-muted">Category</label>
          <select
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as SoundCategory }))}
            className="rounded-lg border border-hairline px-3 py-1.5 font-sans text-sm"
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-sans text-xs text-ink-muted">Audio URL</label>
          <input
            value={form.url}
            onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
            placeholder="https://…mp3"
            className="w-64 rounded-lg border border-hairline px-3 py-1.5 font-sans text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={creating}
          className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 font-sans text-sm font-semibold text-accent-ink disabled:opacity-50"
        >
          <Plus size={14} />
          {creating ? "Adding…" : "Add sound"}
        </button>
      </form>

      {error && (
        <div className="mt-4 rounded-lg border border-red-300 bg-red-50 px-3.5 py-2 font-sans text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-6 overflow-x-auto rounded-xl border border-hairline">
        <table className="w-full text-left font-sans text-sm">
          <thead className="border-b border-hairline text-xs uppercase text-ink-muted">
            <tr>
              <th className="px-4 py-2.5">Preview</th>
              <th className="px-4 py-2.5">Label</th>
              <th className="px-4 py-2.5">Category</th>
              <th className="px-4 py-2.5">Active</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {sounds.map((s) => (
              <tr key={s._id} className="border-b border-hairline last:border-0">
                <td className="px-4 py-2.5">
                  <button
                    onClick={() => togglePreview(s)}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-hairline text-ink-muted hover:text-ink"
                  >
                    {previewingId === s._id ? <Pause size={12} /> : <Play size={12} />}
                  </button>
                </td>
                <td className="px-4 py-2.5 text-ink">{s.label}</td>
                <td className="px-4 py-2.5 text-ink-muted">{s.category}</td>
                <td className="px-4 py-2.5">
                  <input
                    type="checkbox"
                    checked={s.active}
                    onChange={() => handleToggleActive(s)}
                  />
                </td>
                <td className="px-4 py-2.5">
                  <button
                    onClick={() => handleDelete(s._id)}
                    className="text-ink-muted hover:text-red-600"
                    aria-label="Delete sound"
                  >
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {loading && <p className="mt-4 font-sans text-sm text-ink-muted">Loading…</p>}
    </div>
  );
}