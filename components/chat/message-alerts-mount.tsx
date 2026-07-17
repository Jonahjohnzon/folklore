// components/chat/message-alerts-mount.tsx
"use client";

import { useMessageAlertsPoller } from "@/hooks/use-message-alerts";

export function MessageAlertsMount() {
  useMessageAlertsPoller();
  return null;
}