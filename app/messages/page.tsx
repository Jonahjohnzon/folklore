// app/messages/page.tsx
"use client";

import { MessageCircle } from "lucide-react";
import { ConversationList } from "@/components/chat/conversation-list";

export default function MessagesPage() {
  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-5xl overflow-hidden rounded-2xl border border-hairline bg-surface sm:my-6 sm:h-[calc(100vh-6rem)]">
      <div className="flex w-full flex-col lg:w-80 lg:shrink-0 lg:border-r lg:border-hairline">
        <div className="border-b border-hairline px-4 py-4">
          <h1 className="font-display text-lg font-semibold text-ink">Messages</h1>
        </div>
        <ConversationList />
      </div>

      <div className="hidden flex-1 flex-col items-center justify-center gap-3 lg:flex">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-bg">
          <MessageCircle size={26} className="text-ink-muted" />
        </div>
        <p className="font-sans text-sm text-ink-muted">Select a conversation to start chatting</p>
      </div>
    </div>
  );
}