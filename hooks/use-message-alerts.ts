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
type CountListener = (count: number) => void;

const listeners = new Set<Listener>();
const countListeners = new Set<CountListener>();

function emitAlert(alert: IncomingMessageAlert) {
  listeners.forEach((l) => l(alert));
}

function emitCount(count: number) {
  countListeners.forEach((l) => l(count));
}

export function onIncomingMessage(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const POLL_MS = 10000;

// --- singleton poll loop state -------------------------------------------
let pollTimer: ReturnType<typeof setInterval> | null = null;
let refCount = 0;
const prevCounts = new Map<string, number>();
let initialized = false;

async function poll() {
  try {
    const { data } = await ChatService.getConversations();
    let total = 0;
    const nextCounts = new Map<string, number>();

    for (const c of data.conversations) {
      total += c.unreadCount;
      nextCounts.set(c._id, c.unreadCount);

      if (!initialized) continue;

      const prev = prevCounts.get(c._id) ?? 0;
      if (c.unreadCount > prev && c.otherUser && c.lastMessage) {
        emitAlert({
          conversationId: c._id,
          senderName: c.otherUser.displayName,
          senderAvatarUrl: c.otherUser.avatarUrl,
          body: c.lastMessage.deleted ? "Sent a message" : c.lastMessage.body,
        });
      }
    }

    prevCounts.clear();
    nextCounts.forEach((v, k) => prevCounts.set(k, v));
    initialized = true;
    emitCount(total);
  } catch {
    // silent — a failed poll just means we retry in POLL_MS
  }
}

function startPolling() {
  refCount += 1;
  if (pollTimer) return; // already running

  poll();
  pollTimer = setInterval(poll, POLL_MS);
  document.addEventListener("visibilitychange", onVisible);
}

function stopPolling() {
  refCount -= 1;
  if (refCount > 0) return;

  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
  document.removeEventListener("visibilitychange", onVisible);
  // reset so a fresh login starts clean
  initialized = false;
  prevCounts.clear();
}

function onVisible() {
  if (document.visibilityState === "visible") poll();
}
// ---------------------------------------------------------------------------

/**
 * Safe to call from as many components as you like — the underlying
 * poll loop is a singleton (ref-counted), so only one network poll
 * runs regardless of how many components use this hook.
 */
export function useMessageAlertsPoller() {
  const snap = useSnapshot(store);
  const isLoggedIn = snap.hydrated && !!snap._id;
  const [unreadTotal, setUnreadTotal] = useState(0);

  useEffect(() => {
    if (!isLoggedIn) return;

    const onCount = (count: number) => setUnreadTotal(count);
    countListeners.add(onCount);
    startPolling();

    return () => {
      countListeners.delete(onCount);
      stopPolling();
    };
  }, [isLoggedIn]);

  return unreadTotal;
}

/** Lightweight read-only hook for components that just need the badge number. */
export function useUnreadMessageCount() {
  return useMessageAlertsPoller();
}