import ApiClient from "@/app/ApiCore";

const api = new ApiClient();

export interface NotificationItem {
  id: string;
  type: string;
  message: string;
  link: string;
  read: boolean;
  createdAt: string;
}

export const NotificationService = {
  list: (cursor?: string) => api.get<{ data: { notifications: NotificationItem[]; unreadCount: number; nextCursor: string | null } }>("/api/notifications", cursor ? { cursor } : undefined),
  markRead: (notificationId: string) => api.patch("/api/notifications", { notificationId }),
  markAllRead: () => api.patch("/api/notifications", { markAll: true }),
};
