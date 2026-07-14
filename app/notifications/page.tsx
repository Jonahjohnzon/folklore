// app/notifications/page.tsx
"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import { Bell, ArrowLeft, CheckCheck, Loader2, Trash2, X, Inbox } from "lucide-react";
import { NotificationService, type NotificationItem } from "@/app/services/NotificationService";

const NOTIFICATION_ICONS: Record<string, string> = {
  comment: "💬",
  like: "❤️",
  follow: "👤",
  chapter: "📖",
  system: "🔔",
};

type FilterMode = "all" | "unread";

function getDateGroup(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - 7);

  if (date >= startOfToday) return "Today";
  if (date >= startOfYesterday) return "Yesterday";
  if (date >= startOfWeek) return "This week";
  return "Earlier";
}

export default function NotificationsPage() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [filter, setFilter] = useState<FilterMode>("all");
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());
  const [confirmingClear, setConfirmingClear] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const confirmTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    toastTimeout.current = setTimeout(() => setToast(null), 2600);
  }, []);

  const loadInitial = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await NotificationService.list();
      setItems(data.notifications);
      setUnreadCount(data.unreadCount);
      setCursor(data.nextCursor);
      setHasMore(Boolean(data.nextCursor));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitial();
    return () => {
      if (toastTimeout.current) clearTimeout(toastTimeout.current);
      if (confirmTimeout.current) clearTimeout(confirmTimeout.current);
    };
  }, [loadInitial]);

  async function loadMore() {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const { data } = await NotificationService.list(cursor);
      setItems((prev) => [...prev, ...data.notifications]);
      setCursor(data.nextCursor);
      setHasMore(Boolean(data.nextCursor));
    } finally {
      setLoadingMore(false);
    }
  }

  function handleItemClick(item: NotificationItem) {
    if (item.read) return;
    NotificationService.markRead(item.id);
    setUnreadCount((c) => Math.max(0, c - 1));
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, read: true } : i)));
  }

  async function handleMarkAllRead() {
    setMarkingAll(true);
    try {
      await NotificationService.markAllRead();
      setUnreadCount(0);
      setItems((prev) => prev.map((i) => ({ ...i, read: true })));
      showToast("Marked all as read");
    } finally {
      setMarkingAll(false);
    }
  }

  function handleDelete(e: React.MouseEvent, item: NotificationItem) {
    e.preventDefault();
    e.stopPropagation();
    setRemovingIds((prev) => new Set(prev).add(item.id));
    NotificationService.remove(item.id).catch(() => showToast("Couldn't delete that notification"));
    setTimeout(() => {
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
      if (!item.read) setUnreadCount((c) => Math.max(0, c - 1));
    }, 220);
  }

  function handleClearAllClick() {
    if (!confirmingClear) {
      setConfirmingClear(true);
      confirmTimeout.current = setTimeout(() => setConfirmingClear(false), 3500);
      return;
    }
    if (confirmTimeout.current) clearTimeout(confirmTimeout.current);
    setConfirmingClear(false);
    setClearing(true);
    setRemovingIds(new Set(items.map((i) => i.id)));
    NotificationService.clearAll()
      .then(() => showToast("Notifications cleared"))
      .catch(() => showToast("Couldn't clear notifications"))
      .finally(() => setClearing(false));
    setTimeout(() => {
      setItems([]);
      setUnreadCount(0);
      setHasMore(false);
      setRemovingIds(new Set());
    }, 220);
  }

  const visibleItems = useMemo(
    () => (filter === "unread" ? items.filter((i) => !i.read) : items),
    [items, filter]
  );

  const grouped = useMemo(() => {
    let lastGroup = "";
    return visibleItems.map((item) => {
      const group = getDateGroup(item.createdAt);
      const showHeader = group !== lastGroup;
      lastGroup = group;
      return { item, group, showHeader };
    });
  }, [visibleItems]);

  return (
    <main className="mx-auto max-w-4xl px-4 py-6 sm:py-8 sm:px-6">
      <Link href="/" className="mb-5 flex items-center gap-1.5 font-sans text-sm font-medium text-ink-muted hover:text-ink">
        <ArrowLeft size={15} /> Back
      </Link>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Notifications</h1>
          {unreadCount > 0 && (
            <p className="mt-0.5 font-sans text-sm text-ink-muted">
              {unreadCount} unread
            </p>
          )}
        </div>
        {(unreadCount > 0 || items.length > 0) && (
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={markingAll}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-hairline px-3.5 py-2.5 font-sans text-xs font-semibold text-ink transition active:scale-[0.97] active:bg-surface sm:hover:border-accent/50 sm:flex-none sm:py-2 disabled:opacity-50"
              >
                <CheckCheck size={14} />
                {markingAll ? "Marking…" : "Mark all read"}
              </button>
            )}
            {items.length > 0 && (
              <button
                onClick={handleClearAllClick}
                disabled={clearing}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-full border px-3.5 py-2.5 font-sans text-xs font-semibold transition active:scale-[0.97] sm:flex-none sm:py-2 disabled:opacity-50 ${
                  confirmingClear
                    ? "border-red-500/60 bg-red-500/10 text-red-500"
                    : "border-hairline text-ink-muted sm:hover:border-red-500/40 sm:hover:text-red-500"
                }`}
              >
                <Trash2 size={14} />
                {confirmingClear ? "Confirm clear?" : "Clear all"}
              </button>
            )}
          </div>
        )}
      </div>

      {items.length > 0 && (
        <div className="mb-4 flex gap-1.5 overflow-x-auto">
          {(["all", "unread"] as FilterMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilter(mode)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 font-sans text-xs font-semibold transition ${
                filter === mode
                  ? "bg-ink text-bg"
                  : "text-ink-muted hover:bg-surface-raised"
              }`}
            >
              {mode === "all" ? "All" : `Unread${unreadCount > 0 ? ` · ${unreadCount}` : ""}`}
            </button>
          ))}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-hairline bg-surface-raised">
        {loading && (
          <div className="divide-y divide-hairline">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-4">
                <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-bg" />
                <div className="min-w-0 flex-1 space-y-2 py-0.5">
                  <div className="h-3.5 w-3/4 animate-pulse rounded bg-bg" />
                  <div className="h-3 w-1/3 animate-pulse rounded bg-bg" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && visibleItems.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 px-4 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-bg text-ink-muted">
              {filter === "unread" ? <CheckCheck size={20} /> : <Inbox size={20} />}
            </div>
            {filter === "unread" ? (
              <>
                <p className="font-sans text-sm text-ink-muted">Nothing unread. You&apos;re caught up.</p>
                <button
                  onClick={() => setFilter("all")}
                  className="font-sans text-xs font-semibold text-accent hover:underline"
                >
                  View all notifications
                </button>
              </>
            ) : (
              <p className="font-sans text-sm text-ink-muted">You&apos;re all caught up — no notifications yet.</p>
            )}
          </div>
        )}

        {!loading &&
          grouped.map(({ item, group, showHeader }, i) => (
            <div key={item.id}>
              {showHeader && (
                <div className="border-b border-hairline bg-bg/60 px-4 py-1.5 font-sans text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                  {group}
                </div>
              )}
              <div
                className={`group/notif relative transition-all duration-200 ${
                  i !== grouped.length - 1 ? "border-b border-hairline" : ""
                } ${item.read ? "" : "bg-accent/5"} ${
                  removingIds.has(item.id) ? "-translate-x-2 opacity-0" : "opacity-100"
                }`}
              >
                <Link
                  href={item.link}
                  onClick={() => handleItemClick(item)}
                  className="flex items-start gap-3 px-4 py-4 pr-11 font-sans text-sm active:bg-bg sm:hover:bg-bg"
                >
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-bg text-base">
                    {NOTIFICATION_ICONS[item.type] ?? "🔔"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={item.read ? "text-ink-muted" : "font-medium text-ink"}>{item.message}</p>
                    <p className="mt-1 text-xs text-ink-muted">
                      {new Date(item.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  {!item.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" aria-label="Unread" />}
                </Link>
                <button
                  onClick={(e) => handleDelete(e, item)}
                  aria-label="Delete notification"
                  className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-ink-muted opacity-40 transition active:scale-90 active:bg-red-500/10 active:text-red-500 active:opacity-100 sm:opacity-0 sm:hover:bg-red-500/10 sm:hover:text-red-500 sm:group-hover/notif:opacity-100 sm:focus-visible:opacity-100"
                >
                  <X size={15} />
                </button>
              </div>
            </div>
          ))}
      </div>

      {!loading && hasMore && filter === "all" && (
        <div className="mt-5 flex justify-center">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-hairline px-5 py-3 font-sans text-sm font-medium text-ink transition active:scale-[0.98] active:bg-surface sm:w-auto sm:py-2.5 sm:hover:border-accent/50 disabled:opacity-50"
          >
            {loadingMore ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Loading…
              </>
            ) : (
              "Load more"
            )}
          </button>
        </div>
      )}

      {toast && (
        <div className="fixed left-1/2 z-50 -translate-x-1/2 rounded-full bg-ink px-4 py-2.5 font-sans text-xs font-semibold text-bg shadow-lg bottom-[calc(1.5rem+env(safe-area-inset-bottom))]">
          {toast}
        </div>
      )}
    </main>
  );
}