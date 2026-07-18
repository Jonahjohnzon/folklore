// components/chat/conversation-list.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MessageCircle, Loader2, Eraser, Home } from "lucide-react";
import { ChatService, type ConversationDTO } from "@/app/services/ChatService";
import { Avatar } from "@/components/avatar";
import { formatRelativeDate } from "@/lib/format";

export function ConversationList({ activeId }: { activeId?: string }) {
  const [conversations, setConversations] = useState<ConversationDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    ChatService.getConversations()
      .then(({ data }) => !cancelled && setConversations(data.conversations))
      .finally(() => !cancelled && setLoading(false));

    const interval = setInterval(() => {
      ChatService.getConversations().then(({ data }) => !cancelled && setConversations(data.conversations));
    }, 40000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  async function handleClearAll() {
    setClearing(true);
    try {
      await ChatService.clearAllChats();
      setConversations([]);
    } finally {
      setClearing(false);
      setConfirmClearAll(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">

      {conversations.length > 0 && (
        <div className="flex justify-end border-b border-hairline px-4 py-2">
          <button
            onClick={() => setConfirmClearAll(true)}
            className="flex items-center gap-1.5 font-sans text-xs font-medium text-ink-muted transition hover:text-red-600"
          >
            <Eraser size={12} /> Clear all
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex flex-1 items-center justify-center py-12">
          <Loader2 size={18} className="animate-spin text-ink-muted" />
        </div>
      ) : conversations.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-bg">
            <MessageCircle size={24} className="text-ink-muted" />
          </div>
          <p className="font-sans text-sm font-medium text-ink">No conversations yet</p>
          <p className="font-sans text-xs text-ink-muted">Start a chat from someone&apos;s profile and it&apos;ll show up here.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {conversations.map((c) => {
            const isActive = c._id === activeId;
            const name = c.otherUser?.displayName ?? "Deleted user";
            return (
              <Link
                key={c._id}
                href={`/messages/${c._id}`}
                className={`flex items-center gap-3 border-b border-hairline px-4 py-3 transition hover:bg-bg ${isActive ? "bg-bg" : ""}`}
              >
                <div className="relative shrink-0">
                  <Avatar avatarUrl={c.otherUser?.avatarUrl ?? null} name={name} size={44} />
                  {c.unreadCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 font-sans text-[10px] font-bold text-accent-ink">
                      {c.unreadCount > 9 ? "9+" : c.unreadCount}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`truncate font-sans text-sm ${c.unreadCount > 0 ? "font-semibold text-ink" : "font-medium text-ink"}`}>
                      {name}
                    </p>
                    <span className="shrink-0 font-sans text-[11px] text-ink-muted">{formatRelativeDate(c.lastMessageAt)}</span>
                  </div>
                  <p className={`truncate font-sans text-xs italic ${c.lastMessage?.deleted ? "text-ink-muted" : c.unreadCount > 0 ? "font-medium not-italic text-ink" : "not-italic text-ink-muted"}`}>
                    {c.lastMessage?.body ?? "Say hello 👋"}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {confirmClearAll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-hairline bg-surface p-5">
            <h3 className="font-display text-base font-semibold text-ink">Clear all chats?</h3>
            <p className="mt-2 font-sans text-sm text-ink-muted">
              This removes every conversation from your inbox. Anyone who messages you again will reappear here.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setConfirmClearAll(false)}
                className="rounded-full border border-hairline px-4 py-2 font-sans text-sm font-medium text-ink hover:border-accent hover:text-accent"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                disabled={clearing}
                className="flex items-center gap-1.5 rounded-full bg-red-600 px-4 py-2 font-sans text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
              >
                {clearing ? <Loader2 size={14} className="animate-spin" /> : <Eraser size={14} />}
                Clear all
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}