// components/notification-bell.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { NotificationService, type NotificationItem } from "@/app/services/NotificationService";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    NotificationService.list().then(({ data }) => {
      setItems(data.notifications);
      setUnreadCount(data.unreadCount);
    });
    // poll every 60s for new notifications — simple, no websocket needed for v1
    const interval = setInterval(() => {
      NotificationService.list().then(({ data }) => setUnreadCount(data.unreadCount));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function handleOpen() {
    setOpen((o) => !o);
    if (!open) {
      NotificationService.list().then(({ data }) => {
        setItems(data.notifications);
        setUnreadCount(data.unreadCount);
      });
    }
  }

  function handleItemClick(item: NotificationItem) {
    if (!item.read) {
      NotificationService.markRead(item.id);
      setUnreadCount((c) => Math.max(0, c - 1));
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, read: true } : i)));
    }
    setOpen(false);
  }

  return (
    <div className="relative" ref={containerRef}>
      <button onClick={handleOpen} className="relative flex h-9 w-9 items-center justify-center rounded-full text-ink-muted hover:bg-bg" aria-label="Notifications">
        <Bell size={17} />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 font-sans text-[10px] font-semibold text-accent-ink">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-hairline bg-surface-raised shadow-xl">
          <div className="flex items-center justify-between border-b border-hairline px-3.5 py-2.5">
            <p className="font-sans text-sm font-semibold text-ink">Notifications</p>
            {unreadCount > 0 && (
              <button
                onClick={() => {
                  NotificationService.markAllRead();
                  setUnreadCount(0);
                  setItems((prev) => prev.map((i) => ({ ...i, read: true })));
                }}
                className="font-sans text-xs font-medium text-accent hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 && <p className="px-4 py-8 text-center font-sans text-sm text-ink-muted">No notifications yet</p>}
            {items.map((item) => (
              <Link
                key={item.id}
                href={item.link}
                onClick={() => handleItemClick(item)}
                className={`block border-b border-hairline px-3.5 py-2.5 font-sans text-sm transition hover:bg-bg ${item.read ? "text-ink-muted" : "text-ink"}`}
              >
                <p>{item.message}</p>
                <p className="mt-0.5 text-xs text-ink-muted">{new Date(item.createdAt).toLocaleDateString()}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
