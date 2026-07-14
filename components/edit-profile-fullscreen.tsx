"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, User, AtSign, KeyRound, Bell } from "lucide-react";
import { ProfileTab } from "./edit-profile/ProfileTab";
import { AccountTab } from "./edit-profile/AccountTab";
import { PasswordTab } from "./edit-profile/PasswordTab";
import { NotificationsTab } from "./edit-profile/NotificationsTab";
import { DangerZoneTab } from "./edit-profile/DangerZoneTab";

type TabId = "profile" | "account" | "password" | "notifications" | "privacy" | "danger";

const TABS: { id: TabId; label: string; icon: typeof User }[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "account", label: "Account", icon: AtSign },
  { id: "password", label: "Password", icon: KeyRound },
  { id: "notifications", label: "Notifications", icon: Bell },
  // { id: "danger", label: "Deactivate & delete", icon: TriangleAlert },
];

export function EditProfileFullscreen({ onClose }: { onClose: () => void }) {
  const [active, setActive] = useState<TabId>("profile");
  // Tracks unsaved edits per-tab so we can warn before closing / switching away.
  const [dirty, setDirty] = useState<Record<TabId, boolean>>({
    profile: false,
    account: false,
    password: false,
    notifications: false,
    privacy: false,
    danger: false,
  });

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  const markDirty = (tab: TabId, value: boolean) =>
    setDirty((prev) => (prev[tab] === value ? prev : { ...prev, [tab]: value }));

  const anyDirty = Object.values(dirty).some(Boolean);

  const handleClose = () => {
    if (anyDirty && !window.confirm("You have unsaved changes. Discard them?")) return;
    onClose();
  };

  const handleTabChange = (tab: TabId) => {
    if (tab === active) return;
    if (dirty[active] && !window.confirm("You have unsaved changes on this tab. Switch anyway?")) return;
    setActive(tab);
  };

  const content = (
    <div className="fixed inset-0 z-50 flex flex-col bg-bg sm:flex-row">
      {/* Mobile header: title + close, replaces the old floating close button on small screens */}
      <div className="flex shrink-0 items-center justify-between border-b border-hairline bg-page px-4 py-3 sm:hidden">
        <h2 className="font-display text-base font-semibold text-ink">Edit profile</h2>
        <button
          onClick={handleClose}
          aria-label="Close settings"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-hairline text-ink transition active:scale-95 active:bg-surface"
        >
          <X size={16} />
        </button>
      </div>

      {/* Desktop close button, floats over the sidebar/content split */}
      <button
        onClick={handleClose}
        aria-label="Close settings"
        className="absolute right-6 top-6 z-10 hidden h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-hairline text-ink transition hover:border-accent hover:text-accent sm:flex"
      >
        <X size={18} />
      </button>

      {/* Tab rail (desktop sidebar) */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-hairline px-4 py-8 sm:flex">
        <h2 className="px-3 font-display text-lg font-semibold text-ink">Edit profile</h2>
        <nav className="mt-6 flex flex-col gap-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => handleTabChange(id)}
              className={`flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-left font-sans text-sm font-medium transition ${
                active === id
                  ? "bg-accent text-accent-ink"
                  : id === "danger"
                    ? "text-red-500 hover:bg-hairline/40"
                    : "text-ink-muted hover:bg-hairline/40 hover:text-ink"
              }`}
            >
              <Icon size={16} className="shrink-0" />
              {label}
              {dirty[id] && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-current" />}
            </button>
          ))}
        </nav>
      </aside>

      {/* Mobile tab rail: full-width segmented control, every tab always visible, nothing to scroll */}
      <nav
        className="grid shrink-0 border-b border-hairline bg-page sm:hidden"
        style={{ gridTemplateColumns: `repeat(${TABS.length}, minmax(0, 1fr))` }}
      >
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          const isDanger = id === "danger";
          return (
            <button
              key={id}
              onClick={() => handleTabChange(id)}
              aria-current={isActive ? "true" : undefined}
              className={`relative flex flex-col items-center justify-center gap-1 border-b-2 px-1 py-2.5 font-sans text-[10.5px] font-medium leading-none transition active:bg-surface ${
                isActive
                  ? "border-accent text-accent"
                  : isDanger
                    ? "border-transparent text-red-500"
                    : "border-transparent text-ink-muted"
              }`}
            >
              <span className="relative">
                <Icon size={17} />
                {dirty[id] && (
                  <span className="absolute -right-1 -top-1 h-1.5 w-1.5 rounded-full bg-accent" />
                )}
              </span>
              <span className="truncate">{label}</span>
            </button>
          );
        })}
      </nav>

      {/* Active panel */}
      <div className="flex-1 overflow-y-auto px-4 pb-10 pt-5 sm:px-10 sm:pt-10">
        <div className="mx-auto max-w-xl">
          {active === "profile" && <ProfileTab onDirtyChange={(v) => markDirty("profile", v)} />}
          {active === "account" && <AccountTab onDirtyChange={(v) => markDirty("account", v)} />}
          {active === "password" && <PasswordTab onDirtyChange={(v) => markDirty("password", v)} />}
          {active === "notifications" && <NotificationsTab onDirtyChange={(v) => markDirty("notifications", v)} />}
          {active === "danger" && <DangerZoneTab onAccountDeleted={onClose} />}
        </div>
      </div>
    </div>
  );

  // Portal to body so the fixed overlay escapes any transformed/overflow-hidden ancestors.
  if (typeof document === "undefined") return null;
  return createPortal(content, document.body);
}

//  {active === "privacy" && <PrivacyTab onDirtyChange={(v) => markDirty("privacy", v)} />}