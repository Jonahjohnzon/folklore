// app/services/ChatService.ts
import ApiClient from "@/app/ApiCore";

const api = new ApiClient();

export interface ConversationDTO {
  _id: string;
  otherUser: { username: string; displayName: string; avatarUrl: string | null } | null;
  lastMessage: { body: string; senderId: string; createdAt: string; deleted: boolean } | null;
  lastMessageAt: string;
  unreadCount: number;
}

export interface MessageDTO {
  _id: string;
  senderId: string;
  body: string;
  deleted: boolean;
  editedAt: string | null;
  createdAt: string;
  readBy: string[];
}

export const ChatService = {
  startConversation: (username: string) =>
    api.post<{ data: { conversationId: string } }>("/api/pages/chat/start", { username }),

  getConversations: () =>
    api.get<{ data: { conversations: ConversationDTO[] } }>("/api/pages/chat/conversations"),

  getMessages: (conversationId: string, before?: string) =>
    api.get<{ data: { messages: MessageDTO[]; hasMore: boolean } }>(
      `/api/pages/chat/conversations/${conversationId}/messages`,
      before ? { before } : undefined
    ),

  sendMessage: (conversationId: string, body: string) =>
    api.post<{ data: { message: MessageDTO } }>(`/api/pages/chat/conversations/${conversationId}/messages`, { body }),

  editMessage: (messageId: string, body: string) =>
    api.patch<{ data: { message: MessageDTO } }>(`/api/pages/chat/messages/${messageId}`, { body }),

  deleteMessage: (messageId: string) =>
    api.delete<{ data: { deleted: boolean } }>(`/api/pages/chat/messages/${messageId}`),

  markRead: (conversationId: string) =>
    api.post<{ data: { read: boolean } }>(`/api/pages/chat/conversations/${conversationId}/read`),

  clearChat: (conversationId: string) =>
    api.post<{ data: { cleared: boolean } }>(`/api/pages/chat/conversations/${conversationId}/clear`),

  clearAllChats: () =>
    api.post<{ data: { cleared: number } }>("/api/pages/chat/conversations/clear-all"),
  getUnreadCount: () =>
    api.get<{ data: { unreadCount: number } }>("/api/pages/chat/unread-count"),
};