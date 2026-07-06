// app/services/AdminService.ts
import ApiClient from "@/app/ApiCore";

const api = new ApiClient();

export interface AdminStats {
  totalUsers: number;
  activeCreators: number;
  totalBooks: number;
  suspendedUsers: number;
}

export type AdminUserStatus = "active" | "suspended" | "deleted";
export type AdminUserRole = "user" | "moderator" | "admin";

export interface AdminUserRow {
  _id: string;
  username: string;
  displayName?: string;
  email: string;
  status: AdminUserStatus;
  role: AdminUserRole;
  creatorStatus: "not_applied" | "pending" | "active" | "suspended";
  createdAt: string;
  verifiedAuthor : boolean
}

export interface AdminBadgeRow {
  _id: string;
  key: string;
  category: "reading_milestone" | "streak";
  tier: number;
  name: string;
  threshold: number;
  active: boolean;
}

interface Envelope<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface CreateBadgeBody {
  key: string;
  category: "reading_milestone" | "streak";
  tier: number;
  name: string;
  threshold: number;
}

export const AdminService = {
  getStats: () => api.get<Envelope<{ stats: AdminStats }>>("/api/admin/stats"),

  getUsers: (page = 1, q?: string) =>
    api.get<Envelope<{ users: AdminUserRow[]; total: number; page: number; hasMore: boolean }>>(
      "/api/admin/users",
      q ? { page, q } : { page }
    ),

  updateUserStatus: (userId: string, status: AdminUserStatus) =>
    api.patch<Envelope<{ user: AdminUserRow }>>(`/api/admin/users/${userId}/status`, { status }),

  updateUserRole: (userId: string, role: AdminUserRole) =>
    api.patch<Envelope<{ user: AdminUserRow }>>(`/api/admin/users/${userId}/role`, { role }),

  getBadges: () => api.get<Envelope<{ badges: AdminBadgeRow[] }>>("/api/admin/badges"),

  toggleBadgeActive: (badgeId: string, active: boolean) =>
    api.patch<Envelope<{ badge: AdminBadgeRow }>>(`/api/admin/badges/${badgeId}`, { active }),

  awardBadge: (userId: string, badgeId: string) =>
    api.post<Envelope<{ awarded: boolean }>>(`/api/admin/users/${userId}/badges`, { badgeId }),

  revokeBadge: (userId: string, badgeId: string) =>
    api.delete<Envelope<{ revoked: boolean }>>(`/api/admin/users/${userId}/badges/${badgeId}`),
  createBadge: (body: CreateBadgeBody) =>
  api.post<Envelope<{ badge: AdminBadgeRow }>>("/api/admin/badges", body),

updateBadge: (badgeId: string, body: Partial<Pick<AdminBadgeRow, "name" | "threshold">>) =>
  api.patch<Envelope<{ badge: AdminBadgeRow }>>(`/api/admin/badges/${badgeId}`, body),
updateVerifiedAuthor: (userId: string, verified: boolean) =>
  api.patch<Envelope<{ user: { username: string; verifiedAuthor: boolean } }>>(
    `/api/admin/users/${userId}/verify`,
    { verified }
  ),
};