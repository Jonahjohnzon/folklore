// hooks/use-message-alerts.ts
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSnapshot } from "valtio";
import { store } from "@/app/store/userStore";
import { ChatService, type ConversationDTO } from "@/app/services/ChatService";

export interface IncomingMessageAlert {
  conversationId: string;
  senderName: string;
  senderAvatarUrl: string | null;
  body: string;
}

type Listener = (alert: IncomingMessageAlert) => void;

const listeners = new Set<Listener>();

function emitAlert(alert: IncomingMessageAlert) {
  listeners.forEach((l) => l(alert));
}

export function onIncomingMessage(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const POLL_MS = 10000;

/**
 * Mount this once, high in the tree (root layout). It owns the polling
 * loop, keeps the navbar badge (via useUnreadCount) in sync, and emits
 * alerts through onIncomingMessage whenever a conversation's unread
 * count goes up compared to the previous poll.
 */
export function useMessageAlertsPoller() {
  const snap = useSnapshot(store);
  const isLoggedIn = snap.hydrated && !!snap._id;
  const prevCounts = useRef<Map<string, number>>(new Map());
  const [unreadTotal, setUnreadTotal] = useState(0);
  const initialized = useRef(false);

  const poll = useCallback(async () => {
    try {
      const { data } = await ChatService.getConversations();
      let total = 0;
      const nextCounts = new Map<string, number>();

      for (const c of data.conversations) {
        total += c.unreadCount;
        nextCounts.set(c._id, c.unreadCount);

        // Skip alerting on the very first poll after mount/reload — otherwise
        // every pre-existing unread conversation fires a toast on page load.
        if (!initialized.current) continue;

        const prev = prevCounts.current.get(c._id) ?? 0;
        if (c.unreadCount > prev && c.otherUser && c.lastMessage) {
          emitAlert({
            conversationId: c._id,
            senderName: c.otherUser.displayName,
            senderAvatarUrl: c.otherUser.avatarUrl,
            body: c.lastMessage.deleted ? "Sent a message" : c.lastMessage.body,
          });
        }
      }

      prevCounts.current = nextCounts;
      initialized.current = true;
      setUnreadTotal(total);
    } catch {
      // silent — a failed poll just means we retry in POLL_MS
    }
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    poll();
    const interval = setInterval(poll, POLL_MS);

    // catch up immediately when the user comes back to the tab, rather
    // than waiting up to POLL_MS for the next scheduled tick
    function onVisible() {
      if (document.visibilityState === "visible") poll();
    }
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [isLoggedIn, poll]);

  return unreadTotal;
}

/** Lightweight read-only hook for components that just need the badge number. */
export function useUnreadMessageCount() {
  return useMessageAlertsPoller();
}