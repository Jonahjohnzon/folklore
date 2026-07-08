"use client";

import { useEffect, useState } from "react";
import { UserService, type NotificationPrefs } from "@/app/services/user.service";
import { SaveBar } from "./shared";

type Prefs = NotificationPrefs;
type SaveStatus = "idle" | "saving" | "saved" | "error";

const DEFAULT_PREFS: Prefs = {
  notifyNewChapter: true,
  notifyComments: true,
  notifyReviews: true,
  notifyNewFollower: true,
  emailDigest: false,
  emailProductUpdates: false,
};

const GROUPS: { title: string; items: { key: keyof Prefs; label: string; hint: string }[] }[] = [
  {
    title: "Activity",
    items: [
      { key: "notifyNewChapter", label: "New chapters", hint: "When authors you follow publish a new chapter" },
      { key: "notifyComments", label: "Comments", hint: "Replies on your chapters and comments" },
      { key: "notifyReviews", label: "Reviews", hint: "New reviews on your books" },
      { key: "notifyNewFollower", label: "New followers", hint: "When someone follows you" },
    ],
  },
  {
    title: "Email",
    items: [
      { key: "emailDigest", label: "Weekly digest", hint: "A roundup of activity on your books" },
      { key: "emailProductUpdates", label: "Product updates", hint: "New features and announcements from Lore" },
    ],
  },
];
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition ${checked ? "bg-accent" : "bg-hairline"}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-page shadow transition ${checked ? "left-5" : "left-0.5"}`}
      />
    </button>
  );
}
function pickPrefs(raw: Partial<Prefs> | null | undefined): Prefs {
  return {
    notifyNewChapter: raw?.notifyNewChapter ?? DEFAULT_PREFS.notifyNewChapter,
    notifyComments: raw?.notifyComments ?? DEFAULT_PREFS.notifyComments,
    notifyReviews: raw?.notifyReviews ?? DEFAULT_PREFS.notifyReviews,
    notifyNewFollower: raw?.notifyNewFollower ?? DEFAULT_PREFS.notifyNewFollower,
    emailDigest: raw?.emailDigest ?? DEFAULT_PREFS.emailDigest,
    emailProductUpdates: raw?.emailProductUpdates ?? DEFAULT_PREFS.emailProductUpdates,
  };
}

export function NotificationsTab({ onDirtyChange }: { onDirtyChange: (dirty: boolean) => void }) {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [initial, setInitial] = useState<Prefs>(DEFAULT_PREFS);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    UserService.getNotificationPrefs()
      .then((res) => {
        const loaded = pickPrefs(res.data.prefs);
        setPrefs(loaded);
        setInitial(loaded);
      })
      .catch(() => {
        // fall back to defaults shown above; user can still edit and save
      })
      .finally(() => setLoading(false));
  }, []);

  const dirty = JSON.stringify(prefs) !== JSON.stringify(initial);
  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);

  const handleSave = async () => {
    setStatus("saving");
    setError(null);
    try {
      const res = await UserService.updateNotificationPrefs(prefs);
      const saved = pickPrefs(res.data.prefs);
      setPrefs(saved);
      setInitial(saved);
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("error");
      setError("Couldn't save your preferences.");
    }
  };

  return (
    <div>
      <h3 className="font-display text-xl font-semibold text-ink">Notifications</h3>
      <p className="mt-1 font-sans text-sm text-ink-muted">Choose what you hear about, and where.</p>

      {loading ? (
        <p className="mt-6 font-sans text-sm text-ink-muted">Loading your preferences…</p>
      ) : (
        GROUPS.map((group) => (
          <div key={group.title} className="mt-6">
            <h4 className="font-sans text-xs font-semibold uppercase tracking-wide text-ink-muted">
              {group.title}
            </h4>
            <div className="mt-3 divide-y divide-hairline rounded-lg border border-hairline">
              {group.items.map((item) => (
                <div key={item.key} className="flex items-center justify-between gap-4 px-4 py-3.5">
                  <div>
                    <p className="font-sans text-sm font-medium text-ink">{item.label}</p>
                    <p className="font-sans text-xs text-ink-muted">{item.hint}</p>
                  </div>
                  <Toggle
                    checked={prefs[item.key]}
                    onChange={(v) => setPrefs((p) => ({ ...p, [item.key]: v }))}
                  />
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      <SaveBar status={status} errorMessage={error} onSave={handleSave} disabled={!dirty} />
    </div>
  );
}

