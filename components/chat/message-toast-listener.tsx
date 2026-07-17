// components/chat/message-toast-listener.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "nextjs-toploader/app";
import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { onIncomingMessage, type IncomingMessageAlert } from "@/hooks/use-message-alerts";
import { Avatar } from "@/components/avatar";

const AUTO_DISMISS_MS = 6000;

/**
 * Mount once near the root. Listens for alerts emitted by the poller and
 * renders a dismissible toast stack. Also fires a native browser
 * notification if the tab isn't focused and the user's granted permission.
 */
export function MessageToastListener() {
  const [toasts, setToasts] = useState<(IncomingMessageAlert & { id: string })[]>([]);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onIncomingMessage((alert) => {
      // Don't toast a conversation you're already looking at
      if (pathname === `/messages/${alert.conversationId}`) return;

      const id = `${alert.conversationId}-${Date.now()}`;
      setToasts((prev) => [...prev, { ...alert, id }]);
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), AUTO_DISMISS_MS);

      if (document.visibilityState !== "visible" && Notification.permission === "granted") {
        const n = new Notification(alert.senderName, {
          body: alert.body,
          icon: alert.senderAvatarUrl ?? "/logo.png",
          tag: alert.conversationId, // collapses repeat notifications from the same thread
        });
        n.onclick = () => {
          window.focus();
          router.push(`/messages/${alert.conversationId}`);
        };
      }
    });
    // Wrap the unsubscribe call so the effect cleanup returns a proper void-returning function
    return () => {
      // Some implementations return a boolean; ignore it.
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      unsubscribe();
    };
  }, [pathname, router]);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-100 flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2 sm:bottom-6 sm:right-6">
      {toasts.map((t) => (
        <button
          key={t.id}
          onClick={() => {
            router.push(`/messages/${t.conversationId}`);
            setToasts((prev) => prev.filter((x) => x.id !== t.id));
          }}
          className="pointer-events-auto flex items-start gap-3 rounded-2xl border border-hairline bg-surface p-3.5 text-left shadow-xl transition hover:border-accent animate-in slide-in-from-bottom-2"
        >
          <Avatar avatarUrl={t.senderAvatarUrl} name={t.senderName} size={38} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <MessageCircle size={12} className="shrink-0 text-accent" />
              <p className="truncate font-sans text-sm font-semibold text-ink">{t.senderName}</p>
            </div>
            <p className="mt-0.5 truncate font-sans text-xs text-ink-muted">{t.body}</p>
          </div>
        </button>
      ))}
    </div>
  );
}