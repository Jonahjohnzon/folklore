"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, User, AtSign, KeyRound, Bell, ShieldCheck, TriangleAlert } from "lucide-react";
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
    <div className="fixed inset-0 z-50  flex bg-bg ">
      {/* Close bar, always visible so it never gets lost behind long forms */}
      <button
        onClick={handleClose}
        aria-label="Close settings"
        className="absolute right-4 top-4 z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-hairline text-ink transition hover:border-accent hover:text-accent sm:right-6 sm:top-6"
      >
        <X size={18} />
      </button>

      {/* Tab rail */}
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

      {/* Mobile tab rail: horizontal scroller instead of sidebar */}
      <nav className="fixed inset-x-0 top-0 z-10 flex gap-1 overflow-x-auto border-b border-hairline bg-page px-3 py-3 sm:hidden">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => handleTabChange(id)}
            className={`flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 font-sans text-xs font-medium transition ${
              active === id
                ? "bg-accent text-accent-ink"
                : id === "danger"
                  ? "text-red-500"
                  : "text-ink-muted"
            }`}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </nav>

      {/* Active panel */}
      <div className="flex-1 overflow-y-auto px-4 pb-16 pt-16 sm:px-10 sm:pt-10">
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