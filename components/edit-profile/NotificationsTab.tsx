"use client";

import { useEffect, useState } from "react";
import { UserService } from "@/app/services/user.service";
import { SaveBar, type SaveStatus } from "./shared";

type Prefs = {
  newChapterFromFollowed: boolean;
  comments: boolean;
  reviews: boolean;
  newFollower: boolean;
  productUpdates: boolean;
  emailDigest: boolean;
};

const DEFAULT_PREFS: Prefs = {
  newChapterFromFollowed: true,
  comments: true,
  reviews: true,
  newFollower: true,
  productUpdates: false,
  emailDigest: true,
};

const GROUPS: { title: string; items: { key: keyof Prefs; label: string; hint: string }[] }[] = [
  {
    title: "Activity",
    items: [
      { key: "newChapterFromFollowed", label: "New chapters", hint: "When authors you follow publish a new chapter" },
      { key: "comments", label: "Comments", hint: "Replies on your chapters and comments" },
      { key: "reviews", label: "Reviews", hint: "New reviews on your books" },
      { key: "newFollower", label: "New followers", hint: "When someone follows you" },
    ],
  },
  {
    title: "Email",
    items: [
      { key: "emailDigest", label: "Weekly digest", hint: "A roundup of activity on your books" },
      { key: "productUpdates", label: "Product updates", hint: "New features and announcements from Lore" },
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

export function NotificationsTab({ onDirtyChange }: { onDirtyChange: (dirty: boolean) => void }) {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [initial, setInitial] = useState<Prefs>(DEFAULT_PREFS);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // UserService.getNotificationPrefs()
    //   .then((res) => {
    //     setPrefs(res.data.prefs);
    //     setInitial(res.data.prefs);
    //   })
    //   .catch(() => {
    //     /* fall back to defaults shown above */
    //   });
  }, []);

  const dirty = JSON.stringify(prefs) !== JSON.stringify(initial);
  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);

  const handleSave = async () => {
    setStatus("saving");
    setError(null);
    // try {
    //   await UserService.updateNotificationPrefs(prefs);
    //   setInitial(prefs);
    //   setStatus("saved");
    //   setTimeout(() => setStatus("idle"), 2000);
    // } catch {
    //   setStatus("error");
    //   setError("Couldn't save your preferences.");
    // }
  };

  return (
    <div>
      <h3 className="font-display text-xl font-semibold text-ink">Notifications</h3>
      <p className="mt-1 font-sans text-sm text-ink-muted">Choose what you hear about, and where.</p>

      {GROUPS.map((group) => (
        <div key={group.title} className="mt-6">
          <h4 className="font-sans text-xs font-semibold uppercase tracking-wide text-ink-muted">{group.title}</h4>
          <div className="mt-3 divide-y divide-hairline rounded-lg border border-hairline">
            {group.items.map((item) => (
              <div key={item.key} className="flex items-center justify-between gap-4 px-4 py-3.5">
                <div>
                  <p className="font-sans text-sm font-medium text-ink">{item.label}</p>
                  <p className="font-sans text-xs text-ink-muted">{item.hint}</p>
                </div>
                <Toggle checked={prefs[item.key]} onChange={(v) => setPrefs((p) => ({ ...p, [item.key]: v }))} />
              </div>
            ))}
          </div>
        </div>
      ))}

      <SaveBar status={status} errorMessage={error} onSave={handleSave} disabled={!dirty} />
    </div>
  );
}