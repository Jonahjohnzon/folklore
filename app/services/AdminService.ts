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
export interface AdminPayoutAccountRow {
  _id: string;
  user: { _id: string; username: string; displayName: string; email: string };
  method: "bank" | "crypto";
  bankName: string | null;
  accountName: string | null;
  accountNumberMasked: string | null;
  cryptoNetwork: string | null;
  walletAddressMasked: string | null;
  verified: boolean;
  updatedAt: string;
}

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

export type SoundCategory = "ambience" | "impact" | "nature" | "music_sting";

export interface AdminSoundRow {
  _id: string;
  label: string;
  category: SoundCategory;
  url: string;
  active: boolean;
  createdAt: string;
}

export interface AdminPayoutRequestRow {
  _id: string;
  user: { username: string; displayName: string; email: string };
  amountCoins: number;
  method: "bank" | "crypto";
  destinationSnapshot: Record<string, string | undefined>;
  status: "pending" | "approved" | "paid" | "rejected";
  adminNote: string | null;
  createdAt: string;
  processedAt: string | null;
}
export interface AdminPromoBanner extends PublicPromoBannerShape {
  _id: string;
  active: boolean;
  order: number;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
}
interface PublicPromoBannerShape {
  type: "books" | "announcement";
  heading: string;
  accent: string;
  bgColor: string;
  waveColor: string;
  books: { title: string; coverUrl: string; href: string }[];
  imageUrl?: string;
  linkUrl?: string;
  linkLabel?: string;
  openInNewTab: boolean;
}

export interface CreateSoundBody {
  label: string;
  category: SoundCategory;
  url: string;
}
export type UpdateSoundBody = Partial<CreateSoundBody> & { active?: boolean };


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
  getSounds: () => api.get<Envelope<{ sounds: AdminSoundRow[] }>>("/api/admin/sounds"),

  createSound: (body: CreateSoundBody) =>
  api.post<Envelope<{ sound: AdminSoundRow }>>("/api/admin/sounds", body),

  updateSound: (soundId: string, body: UpdateSoundBody) =>
  api.patch<Envelope<{ sound: AdminSoundRow }>>(`/api/admin/sounds/${soundId}`, body),

  deleteSound: (soundId: string) =>
  api.delete<Envelope<{ deleted: boolean }>>(`/api/admin/sounds/${soundId}`),
  getPayoutAccounts: (page = 1, opts?: { method?: "bank" | "crypto"; q?: string }) =>
  api.get<Envelope<{ accounts: AdminPayoutAccountRow[]; total: number; page: number; hasMore: boolean }>>(
    "/api/admin/payout-accounts",
    { page, ...(opts?.method ? { method: opts.method } : {}), ...(opts?.q ? { q: opts.q } : {}) }
  ),
  revealPayoutAccount: (id: string) =>
  api.get<Envelope<{ accountNumber: string | null; walletAddress: string | null }>>(`/api/admin/payout-accounts/${id}/reveal`),
  setPayoutVerified: (id: string, verified: boolean) =>
  api.patch<Envelope<{ verified: boolean }>>(`/api/admin/payout-accounts/${id}/verify`, { verified }),
  getPayoutRequests: (page = 1, status?: string) =>
  api.get<Envelope<{ requests: AdminPayoutRequestRow[]; total: number; page: number; hasMore: boolean }>>(
    "/api/admin/payout-requests",
    status && status !== "all" ? { page, status } : { page }
  ),
  updatePayoutRequest: (id: string, body: { status: "approved" | "paid" | "rejected"; adminNote?: string }) =>
  api.patch<Envelope<{ status: string }>>(`/api/admin/payout-requests/${id}`, body),
  getPromoBanners: () => api.get<Envelope<{ banners: AdminPromoBanner[] }>>("/api/admin/promo-banners"),
  createPromoBanner: (body: PublicPromoBannerShape & { active: boolean; order: number }) =>
  api.post<Envelope<{ banner: AdminPromoBanner }>>("/api/admin/promo-banners", body),
  updatePromoBanner: (id: string, body: Partial<PublicPromoBannerShape & { active: boolean; order: number }>) =>
  api.patch<Envelope<{ banner: AdminPromoBanner }>>(`/api/admin/promo-banners/${id}`, body),
  deletePromoBanner: (id: string) =>
  api.delete<Envelope<{ deleted: boolean }>>(`/api/admin/promo-banners/${id}`),
};