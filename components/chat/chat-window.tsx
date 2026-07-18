// components/chat/chat-window.tsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Send, Loader2, MoreVertical, Eraser } from "lucide-react";
import { useSnapshot } from "valtio";
import { store } from "@/app/store/userStore";
import { ChatService, type MessageDTO, type ConversationDTO } from "@/app/services/ChatService";
import { Avatar } from "@/components/avatar";
import { MessageBubble } from "./message-bubble";

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export function ChatWindow({ conversationId }: { conversationId: string }) {
  const snap = useSnapshot(store);
  const myId = snap._id; // ⚠️ adjust to your userStore's actual id field

  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const [otherUser, setOtherUser] = useState<ConversationDTO["otherUser"]>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [draft, setDraft] = useState("");
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const headerMenuRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback((smooth = false) => {
    bottomRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([ChatService.getMessages(conversationId), ChatService.getConversations(), ChatService.markRead(conversationId)])
      .then(([msgRes, convRes]) => {
        if (cancelled) return;
        setMessages(msgRes.data.messages);
        setHasMore(msgRes.data.hasMore);
        setOtherUser(convRes.data.conversations.find((c) => c._id === conversationId)?.otherUser ?? null);
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
          requestAnimationFrame(() => scrollToBottom(false));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [conversationId, scrollToBottom]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (headerMenuRef.current && !headerMenuRef.current.contains(e.target as Node)) setHeaderMenuOpen(false);
    }
    if (headerMenuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [headerMenuOpen]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const latest = messages[messages.length - 1];
      const { data } = await ChatService.getMessages(conversationId);
      if (data.messages.length !== messages.length || data.messages.at(-1)?._id !== latest?._id) {
        setMessages(data.messages);
        ChatService.markRead(conversationId);
        requestAnimationFrame(() => scrollToBottom(true));
      }
    }, 25000);
    return () => clearInterval(interval);
  }, [conversationId, messages, scrollToBottom]);

  async function handleLoadMore() {
    if (loadingMore || !hasMore || messages.length === 0) return;
    setLoadingMore(true);
    const container = scrollRef.current;
    const prevHeight = container?.scrollHeight ?? 0;
    const { data } = await ChatService.getMessages(conversationId, messages[0].createdAt);
    setMessages((prev) => [...data.messages, ...prev]);
    setHasMore(data.hasMore);
    setLoadingMore(false);
    requestAnimationFrame(() => {
      if (container) container.scrollTop = container.scrollHeight - prevHeight;
    });
  }

  async function handleSend() {
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    setDraft("");
    try {
      const { data } = await ChatService.sendMessage(conversationId, body);
      setMessages((prev) => [...prev, data.message]);
      requestAnimationFrame(() => scrollToBottom(true));
    } catch (err) {
      console.error(err);
      setDraft(body);
    } finally {
      setSending(false);
    }
  }

  async function handleEditMessage(messageId: string, newBody: string) {
    const { data } = await ChatService.editMessage(messageId, newBody);
    setMessages((prev) => prev.map((m) => (m._id === messageId ? data.message : m)));
  }

  async function handleDeleteMessage(messageId: string) {
    if (deletingId) return; // avoid overlapping deletes / double-clicks
    setDeletingId(messageId);
    try {
      await ChatService.deleteMessage(messageId);
      setMessages((prev) => prev.map((m) => (m._id === messageId ? { ...m, deleted: true, body: "" } : m)));
    } catch (err) {
      console.error(err);
      // optionally surface a toast/error state here
    } finally {
      setDeletingId(null);
    }
  }

  async function handleClearChat() {
    if (clearing) return;
    setClearing(true);
    try {
      await ChatService.clearChat(conversationId);
      setMessages([]);
      setHasMore(false);
      setConfirmClear(false);
    } catch (err) {
      console.error(err);
      // optionally surface a toast/error state here
    } finally {
      setClearing(false);
    }
  }

  const displayName = otherUser?.displayName ?? "Chat";

  return (
    <div className="flex h-full flex-1 flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-hairline px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href="/messages" className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-bg lg:hidden">
            <ArrowLeft size={17} className="text-ink-muted" />
          </Link>
          {otherUser ? (
            <Link href={`/profile/${otherUser.username}`} className="flex items-center gap-2.5">
              <Avatar avatarUrl={otherUser.avatarUrl} name={displayName} size={36} />
              <div>
                <p className="font-sans text-sm font-semibold text-ink">{displayName}</p>
                <p className="font-sans text-xs text-ink-muted">@{otherUser.username}</p>
              </div>
            </Link>
          ) : (
            <p className="font-sans text-sm font-medium text-ink-muted">{loading ? "Loading…" : displayName}</p>
          )}
        </div>

        <div ref={headerMenuRef} className="relative">
          <button
            onClick={() => setHeaderMenuOpen((o) => !o)}
            aria-label="Chat options"
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-muted transition hover:bg-bg"
          >
            <MoreVertical size={16} />
          </button>
          {headerMenuOpen && (
            <div className="absolute right-0 top-full z-10 mt-1 w-40 overflow-hidden rounded-xl border border-hairline bg-surface shadow-lg">
              <button
                onClick={() => {
                  setHeaderMenuOpen(false);
                  setConfirmClear(true);
                }}
                className="flex w-full items-center gap-2 px-3 py-2.5 font-sans text-xs text-red-600 transition hover:bg-red-50"
              >
                <Eraser size={13} /> Clear chat
              </button>
            </div>
          )}
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 size={18} className="animate-spin text-ink-muted" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <p className="font-sans text-sm text-ink-muted">No messages here yet</p>
          </div>
        ) : (
          <>
            {hasMore && (
              <div className="flex justify-center pb-2">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="rounded-full border border-hairline px-3 py-1 font-sans text-xs text-ink-muted transition hover:border-accent hover:text-accent"
                >
                  {loadingMore ? "Loading…" : "Load earlier messages"}
                </button>
              </div>
            )}
            {messages.map((m) => (
              <MessageBubble
                key={m._id}
                mine={m.senderId === myId}
                body={m.body}
                time={formatTime(m.createdAt)}
                deleted={m.deleted}
                edited={!!m.editedAt}
                deleting={deletingId === m._id}
                onEdit={(newBody) => handleEditMessage(m._id, newBody)}
                onDelete={() => handleDeleteMessage(m._id)}
              />
            ))}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      <div className="flex items-end gap-2 border-t border-hairline p-3">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Write a message…"
          rows={1}
          className="max-h-32 flex-1 resize-none rounded-2xl border border-hairline bg-bg px-4 py-2.5 font-sans text-sm text-ink outline-none focus:border-accent"
        />
        <button
          onClick={handleSend}
          disabled={!draft.trim() || sending}
          aria-label="Send message"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-accent-ink transition hover:opacity-90 disabled:opacity-40"
        >
          {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      </div>

      {confirmClear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-hairline bg-surface p-5">
            <h3 className="font-display text-base font-semibold text-ink">Clear this chat?</h3>
            <p className="mt-2 font-sans text-sm text-ink-muted">
              This clears the conversation on your side only — {displayName} will still see the full history.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setConfirmClear(false)}
                disabled={clearing}
                className="rounded-full border border-hairline px-4 py-2 font-sans text-sm font-medium text-ink hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleClearChat}
                disabled={clearing}
                className="flex items-center justify-center gap-1.5 rounded-full bg-red-600 px-4 py-2 font-sans text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {clearing && <Loader2 size={14} className="animate-spin" />}
                {clearing ? "Clearing…" : "Clear"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}