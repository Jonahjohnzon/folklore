import { proxy } from "valtio";
import type { UserMode, AccountStatus, CreatorStatus } from "@/lib/types";

export const store = proxy({
  // auth / hydration
  hydrated: false,
  _id: null as string | null,
  authChecked: false,
  coinBalance: 0,
  email: "",
  emailVerified: false,

  // public identity
  username: "",
  displayName: "" as string | undefined,
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
  role: "user" as "user" | "moderator" | "admin",

  // compliance
  dateOfBirth: null as string | null,
  marketingOptIn: false,
  termsAcceptedAt: null as string | null,

  preferences: {} as Record<string, unknown>,

  createdAt: null as string | null,
  updatedAt: null as string | null,
  websiteUrl: null as string | null,
  profileMenuOpen: false,
});