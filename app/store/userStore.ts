import { proxy } from "valtio";
import type { UserMode, AccountStatus, CreatorStatus } from "@/lib/types";

export const store = proxy({
  // auth / hydration
  hydrated: false,
  _id: null as string | null,
  authChecked: false, // flips true once the initial /api/pages/auth/me check resolves — use this to avoid a logged-out flash on refresh

  // auth credentials (public-safe)
  email: "",
  emailVerified: false,

  // public identity
  username: "",
  displayName:"" as string | undefined,
  avatarUrl: null as string | null,
  bio: null as string | null,

  // mode toggle
  activeMode: "reader" as UserMode,

  // creator fields
  penName: null as string | null,
  creatorStatus: "not_applied" as CreatorStatus,
  creatorActivatedAt: null as string | null,

  // account health
  status: "active" as AccountStatus,
  matureContentEnabled: false,

  // compliance
  dateOfBirth: null as string | null,
  marketingOptIn: false,
  termsAcceptedAt: null as string | null,

  // personalisation
  preferences: {} as Record<string, unknown>,

  createdAt: null as string | null,
  updatedAt: null as string | null,
  websiteUrl:null as string | null,
  // UI-only state (not from the server)
  profileMenuOpen: false,
});