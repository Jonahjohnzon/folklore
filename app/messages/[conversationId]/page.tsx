// app/messages/[conversationId]/page.tsx
"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Home } from "lucide-react";
import { ConversationList } from "@/components/chat/conversation-list";
import { ChatWindow } from "@/components/chat/chat-window";

export default function ConversationPage() {
  const params = useParams<{ conversationId: string }>();

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-5xl overflow-hidden rounded-2xl border border-hairline bg-surface sm:my-6 sm:h-[calc(100vh-6rem)]">
      <div className="hidden w-80 shrink-0 flex-col border-r border-hairline lg:flex">
        <div className="flex items-center justify-between border-b border-hairline px-4 py-4">
          <h1 className="font-display text-lg font-semibold text-ink">Messages</h1>
          <Link
            href="/"
            aria-label="Go to home"
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-muted transition hover:bg-bg"
          >
            <Home size={17} />
          </Link>
        </div>
        <ConversationList activeId={params.conversationId} />
      </div>
      <ChatWindow conversationId={params.conversationId} />
    </div>
  );
}