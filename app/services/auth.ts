import ApiClient from "@/app/ApiCore";

const api = new ApiClient();

export interface LoginBody {
  identifier: string; // email or username
  password: string;
}

export interface RegisterBody {
  email: string;
  username: string;
  password: string;
  displayName?: string;
  dateOfBirth: string;
  marketingOptIn: boolean;
  agreedToTerms: boolean;
}

export interface AuthUser {
  _id: string;
  email: string;
  username: string;
  displayName?: string;
  role: "user" | "moderator" | "admin"; // add this
  avatarUrl?: string;
  activeMode: "reader" | "creator";
  creatorStatus: "not_applied" | "pending" | "active" | "suspended";
  status: "active" | "suspended" | "deleted";
  emailVerified: boolean;
  matureContentEnabled: boolean;
  penName:string;
  creatorActivatedAt: string | null;
  bio:string | null;
  preferences: Record<string, unknown>;
  websiteUrl:string
}

export interface AuthResponse {
  success: boolean;
  data: { user: AuthUser };
  message: string;
}

export const AuthService = {
  login: (body: LoginBody) => api.post<AuthResponse>("/api/pages/auth/login", body),
  register: (body: RegisterBody) => api.post<AuthResponse>("/api/pages/auth/register", body),
  logout: () => api.post<{ success: boolean }>("/api/pages/auth/logout"),
  // AuthService.ts
  me: (options?: { headers?: Record<string, string> }) =>
  api.get<{ success: boolean; data: { user: AuthUser } }>("/api/pages/auth/me", {}, options),
  checkUsernameAvailable: (username: string) =>
  api.get<{ success: boolean; data: { available: boolean } }>("/api/pages/auth/username-available", { username }),
  deactivateAccount: () => api.post<{ success: boolean }>("/api/pages/auth/deactivate"),
  deleteAccount: () => api.delete<{ success: boolean }>("/api/pages/auth/delete"),
  changePassword: (body: { currentPassword: string; newPassword: string }) =>
  api.post<{ success: boolean }>("/api/pages/auth/change-password", body),
  requestEmailChange: (email: string) =>
  api.post<{ success: boolean }>("/api/pages/auth/request-email-change", { email }),
  googleSignIn: (idToken: string) =>
  api.post<AuthResponse>("/api/pages/auth/google", { idToken }),
  verifyEmail: (token: string) =>
    api.post<{ success: boolean; data: { verified: boolean } }>("/api/pages/auth/verify-email", { token }),
  resendVerification: () =>
    api.post<{ success: boolean; data: { sent: boolean } }>("/api/pages/auth/resend-verification"),
  forgotPassword: (identifier: string) =>
  api.post<{ success: boolean; data: { sent: boolean } }>("/api/pages/auth/forgot-password", { identifier }),
  resetPassword: (body: { token: string; newPassword: string }) =>
  api.post<{ success: boolean; data: { reset: boolean } }>("/api/pages/auth/reset-password", body),
  confirmEmailChange: (token: string) =>
  api.post<{ success: boolean; data: { verified: boolean; email: string } }>(
    "/api/pages/auth/verify-email-change",
    { token }
  ),

};