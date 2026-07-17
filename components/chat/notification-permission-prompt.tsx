// components/chat/notification-permission-prompt.tsx
"use client";

import { useEffect, useState } from "react";
import { useSnapshot } from "valtio";
import { Bell, X } from "lucide-react";
import { store } from "@/app/store/userStore";

const DISMISSED_KEY = "notif-prompt-dismissed";

export function NotificationPermissionPrompt() {
  const snap = useSnapshot(store);
  const isLoggedIn = snap.hydrated && !!snap._id;
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) return;
    if (typeof Notification === "undefined") return;
    if (Notification.permission !== "default") return;
    if (localStorage.getItem(DISMISSED_KEY)) return;

    const timer = setTimeout(() => setShow(true), 4000);
    return () => clearTimeout(timer);
  }, [isLoggedIn]);

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, "1");
    setShow(false);
  }

  async function enable() {
    await Notification.requestPermission();
    dismiss();
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 z-100 flex max-w-xs items-start gap-3 rounded-2xl border border-hairline bg-surface p-4 shadow-xl sm:bottom-6 sm:left-6">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/15">
        <Bell size={16} className="text-accent" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-sans text-sm font-medium text-ink">Get notified of new messages</p>
        <p className="mt-0.5 font-sans text-xs text-ink-muted">Turn on browser notifications so you don&apos;t miss a reply.</p>
        <div className="mt-2 flex gap-2">
          <button
            onClick={enable}
            className="rounded-full bg-accent px-3 py-1.5 font-sans text-xs font-semibold text-accent-ink hover:opacity-90"
          >
            Enable
          </button>
          <button
            onClick={dismiss}
            className="rounded-full px-3 py-1.5 font-sans text-xs font-medium text-ink-muted hover:text-ink"
          >
            Not now
          </button>
        </div>
      </div>
      <button onClick={dismiss} aria-label="Dismiss" className="shrink-0 text-ink-muted hover:text-ink">
        <X size={14} />
      </button>
    </div>
  );
}