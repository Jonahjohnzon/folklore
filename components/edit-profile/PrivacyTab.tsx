"use client";

import { useEffect, useState } from "react";
import { UserX } from "lucide-react";
import { UserService, type PublicUser } from "@/app/services/user.service";
import { SaveBar, type SaveStatus } from "./shared";

type PrivacySettings = {
  profileVisibility: "public" | "followers" | "private";
  allowDirectMessages: "everyone" | "following" | "no_one";
  doNotDisturb: boolean;
  showReadingActivity: boolean;
};

const DEFAULTS: PrivacySettings = {
  profileVisibility: "public",
  allowDirectMessages: "everyone",
  doNotDisturb: false,
  showReadingActivity: true,
};

function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex rounded-full border border-hairline p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`cursor-pointer rounded-full px-3.5 py-1.5 font-sans text-xs font-semibold transition ${
            value === opt.value ? "bg-accent text-accent-ink" : "text-ink-muted hover:text-ink"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function PrivacyTab({ onDirtyChange }: { onDirtyChange: (dirty: boolean) => void }) {
  const [settings, setSettings] = useState<PrivacySettings>(DEFAULTS);
  const [initial, setInitial] = useState<PrivacySettings>(DEFAULTS);
  const [blocked, setBlocked] = useState<PublicUser[]>([]);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // UserService.getPrivacySettings()
    //   .then((res) => {
    //     setSettings(res.data.settings);
    //     setInitial(res.data.settings);
    //   })
    //   .catch(() => {});
    // UserService.getBlockedUsers()
    //   .then((res) => setBlocked(res.data.users))
    //   .catch(() => {});
  }, []);

  const dirty = JSON.stringify(settings) !== JSON.stringify(initial);
  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);

  const handleUnblock = async (username: string) => {
    setBlocked((prev) => prev.filter((u) => u.username !== username));
    try {
      await UserService.unblockUser(username);
    } catch {
      // Roll back on failure
      UserService.getBlockedUsers().then((res) => setBlocked(res.data.users));
    }
  };

  const handleSave = async () => {
    setStatus("saving");
    setError(null);
    try {
      await UserService.updatePrivacySettings(settings);
      setInitial(settings);
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("error");
      setError("Couldn't save your privacy settings.");
    }
  };

  return (
    <div>
      <h3 className="font-display text-xl font-semibold text-ink">Privacy</h3>
      <p className="mt-1 font-sans text-sm text-ink-muted">Control who can see and reach you.</p>

      <div className="mt-6 flex items-center justify-between gap-4">
        <div>
          <p className="font-sans text-sm font-medium text-ink">Who can see your profile</p>
          <p className="font-sans text-xs text-ink-muted">Private profiles still show public works.</p>
        </div>
        <SegmentedControl
          value={settings.profileVisibility}
          onChange={(v) => setSettings((s) => ({ ...s, profileVisibility: v }))}
          options={[
            { value: "public", label: "Everyone" },
            { value: "followers", label: "Followers" },
            { value: "private", label: "Only me" },
          ]}
        />
      </div>

      <div className="mt-5 flex items-center justify-between gap-4">
        <div>
          <p className="font-sans text-sm font-medium text-ink">Who can message you</p>
          <p className="font-sans text-xs text-ink-muted">Applies to new conversations only.</p>
        </div>
        <SegmentedControl
          value={settings.allowDirectMessages}
          onChange={(v) => setSettings((s) => ({ ...s, allowDirectMessages: v }))}
          options={[
            { value: "everyone", label: "Everyone" },
            { value: "following", label: "Following" },
            { value: "no_one", label: "No one" },
          ]}
        />
      </div>

      <div className="mt-5 flex items-center justify-between gap-4">
        <div>
          <p className="font-sans text-sm font-medium text-ink">Do not disturb</p>
          <p className="font-sans text-xs text-ink-muted">Pause all notification badges and sounds.</p>
        </div>
        <button
          role="switch"
          aria-checked={settings.doNotDisturb}
          onClick={() => setSettings((s) => ({ ...s, doNotDisturb: !s.doNotDisturb }))}
          className={`relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition ${
            settings.doNotDisturb ? "bg-accent" : "bg-hairline"
          }`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-page shadow transition ${
              settings.doNotDisturb ? "left-5" : "left-0.5"
            }`}
          />
        </button>
      </div>

      {/* Blocked users */}
      <div className="mt-8">
        <h4 className="font-sans text-xs font-semibold uppercase tracking-wide text-ink-muted">Blocked accounts</h4>
        {blocked.length === 0 ? (
          <p className="mt-3 font-sans text-sm text-ink-muted">{"You haven't blocked anyone."}</p>
        ) : (
          <ul className="mt-3 divide-y divide-hairline rounded-lg border border-hairline">
            {blocked.map((user) => (
              <li key={user.username} className="flex items-center justify-between gap-3 px-4 py-3">
                <span className="font-sans text-sm text-ink">@{user.username}</span>
                <button
                  onClick={() => handleUnblock(user.username)}
                  className="flex cursor-pointer items-center gap-1.5 font-sans text-xs font-semibold text-ink-muted hover:text-accent"
                >
                  <UserX size={13} />
                  Unblock
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <SaveBar status={status} errorMessage={error} onSave={handleSave} disabled={!dirty} />
    </div>
  );
}