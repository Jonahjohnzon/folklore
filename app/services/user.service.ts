import ApiClient from "@/app/ApiCore";
import type { AuthUser } from "./auth";
import { uploadImageToCloudinary } from "@/lib/cloudinary-client";
const api = new ApiClient();

export interface PublicUser {
  _id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string;
  creatorStatus: string;
  createdAt: string;
  isFollowing?: boolean;
  isBlocked?: boolean;
  websiteUrl:string;
  followerCount:number;
  badges: PublicUserBadge[];
}

export interface PublicUserBadge {
  key: string;
  category: "reading_milestone" | "streak";
  tier: number;
  name: string;
  description: string;
  earnedAt: string;
}

export interface CreatorApplyBody {
  penName: string;
  bio?: string;
}

export interface UpdateUserBody {
  displayName?: string;
  bio?: string;
  avatarUrl?: string | null;
  matureContentEnabled?: boolean;
  preferences?: Record<string, unknown>;
  username?:string
  websiteUrl?:string
}

export interface NotificationPrefs {
  notifyNewChapter: boolean;
  notifyComments: boolean;
  notifyReviews: boolean;
  notifyNewFollower: boolean;
  emailDigest: boolean;
  emailProductUpdates: boolean;
}


export const UserService = {
  updateMe: (body: UpdateUserBody) =>
    api.patch<{ success: boolean; data: { user: AuthUser } }>("/api/pages/users/me", body),

  applyCreator: (body: CreatorApplyBody) =>
    api.post<{ success: boolean; data: { user: AuthUser } }>("/api/pages/creator/apply", body),

  getPublicProfile: (username: string) =>
    api.get<{ success: boolean; data: { user: PublicUser } }>(`/api/pages/users/${username}`),

  follow: (username: string) => api.post<{ success: boolean }>(`/api/pages/users/${username}/follow`),
  unfollow: (username: string) => api.delete<{ success: boolean }>(`/api/pages/users/${username}/follow`),
  block: (username: string) => api.post<{ success: boolean }>(`/api/pages/users/${username}/block`),
  unblock: (username: string) => api.delete<{ success: boolean }>(`/api/pages/users/${username}/block`),
    uploadAvatar: async (username: string, file: File) => {
      const { url } = await uploadImageToCloudinary(file, "avatars");
      return api.patch<{ success: boolean; data: { user: AuthUser } }>("/api/pages/users/me", {
        avatarUrl: url,
      });
},
getBlockedUsers: () =>
  api.get<{ success: boolean; data: { users: PublicUser[] } }>("/api/pages/users/me/blocked"),
unblockUser: (username: string) =>
  api.delete<{ success: boolean }>(`/api/pages/users/${username}/block`),
updatePrivacySettings: (settings: Record<string, unknown>) =>
  api.patch<{ success: boolean }>("/api/pages/users/me/privacy", settings),
getNotificationPrefs: () =>
  api.get<{ success: boolean; data: { prefs: NotificationPrefs } }>(
    "/api/pages/users/me/notification-prefs"
  ),

updateNotificationPrefs: (prefs: Partial<NotificationPrefs>) =>
  api.patch<{ success: boolean; data: { prefs: NotificationPrefs } }>(
    "/api/pages/users/me/notification-prefs",
    prefs
  ),

};