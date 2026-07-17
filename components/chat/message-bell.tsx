// components/chat/message-bell.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { useDropdown } from "@/hooks/use-dropdown"; // extract your existing hook from navbar.tsx if it's local to that file
import { ChatService, type ConversationDTO } from "@/app/services/ChatService";
import { useUnreadMessageCount, onIncomingMessage } from "@/hooks/use-message-alerts";
import { Avatar } from "@/components/avatar";
import { formatRelativeDate } from "@/lib/format";

export function MessageBell() {
  const { open, setOpen, ref } = useDropdown<HTMLDivElement>();
  const unreadTotal = useUnreadMessageCount();
  const [conversations, setConversations] = useState<ConversationDTO[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadPreview() {
    setLoading(true);
    try {
      const { data } = await ChatService.getConversations();
      setConversations(data.conversations.slice(0, 5));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (open) loadPreview();
  }, [open]);

  // keep the dropdown's preview fresh if it's open when a new message lands
  useEffect(() => {
    const unsubscribe = onIncomingMessage(() => {
      if (open) loadPreview();
    });
    return () => {
      unsubscribe();
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Messages"
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-hairline text-ink-muted transition hover:border-accent hover:text-accent"
      >
        <MessageCircle size={16} />
        {unreadTotal > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 font-sans text-[10px] font-bold text-accent-ink">
            {unreadTotal > 9 ? "9+" : unreadTotal}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-hairline bg-surface-raised shadow-xl">
          <div className="flex items-center justify-between border-b border-hairline px-3.5 py-2.5">
            <span className="font-sans text-sm font-semibold text-ink">Messages</span>
            <Link
              href="/messages"
              onClick={() => setOpen(false)}
              className="font-sans text-xs font-medium text-accent hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <p className="px-3.5 py-6 text-center font-sans text-xs text-ink-muted">Loading…</p>
            ) : conversations.length === 0 ? (
              <p className="px-3.5 py-6 text-center font-sans text-xs text-ink-muted">No messages yet.</p>
            ) : (
              conversations.map((c) => {
                const name = c.otherUser?.displayName ?? "Deleted user";
                return (
                  <Link
                    key={c._id}
                    href={`/messages/${c._id}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 transition hover:bg-bg"
                  >
                    <div className="relative shrink-0">
                      <Avatar avatarUrl={c.otherUser?.avatarUrl ?? null} name={name} size={36} />
                      {c.unreadCount > 0 && (
                        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-accent ring-2 ring-surface-raised" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`truncate font-sans text-xs ${c.unreadCount > 0 ? "font-semibold text-ink" : "font-medium text-ink"}`}>
                          {name}
                        </p>
                        <span className="shrink-0 font-sans text-[10px] text-ink-muted">{formatRelativeDate(c.lastMessageAt)}</span>
                      </div>
                      <p className="truncate font-sans text-[11px] text-ink-muted">
                        {c.lastMessage?.deleted ? "This message was deleted" : c.lastMessage?.body ?? "Say hello 👋"}
                      </p>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}