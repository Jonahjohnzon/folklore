// components/chat/message-button.tsx
"use client";

import { useState } from "react";
import { useRouter } from "nextjs-toploader/app";
import { MessageCircle, Loader2 } from "lucide-react";
import { ChatService } from "@/app/services/ChatService";

export function MessageButton({ username }: { username: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (loading) return;
    setLoading(true);
    try {
      const { data } = await ChatService.startConversation(username);
      router.push(`/messages/${data.conversationId}`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="flex items-center gap-1.5 rounded-full border border-hairline px-4 py-2 font-sans text-sm font-semibold text-ink transition hover:border-accent hover:text-accent disabled:opacity-60"
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : <MessageCircle size={14} />}
      Message
    </button>
  );
}