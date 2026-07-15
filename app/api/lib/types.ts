// ============================================================
//  BOOKPLATFORM — Shared TypeScript Types & Enums
// ============================================================

// ── Users & Identity ─────────────────────────────────────────
export type UserMode = "reader" | "creator";
export type AccountStatus = "active" | "suspended" | "deleted";
export type CreatorStatus = "not_applied" | "pending" | "active" | "suspended";

// ── Creator Onboarding ────────────────────────────────────────
export type OnboardingStep =
  | "pen_name"
  | "payout_details"
  | "tax_form"
  | "content_agreement"
  | "complete";

// ── Books & Chapters ──────────────────────────────────────────
export type BookStatus = "draft" | "ongoing" | "completed" | "hiatus" | "removed";
export type ChapterAccess = "free" | "coins" | "purchase" | "subscriber_only";

// ── Tags ──────────────────────────────────────────────────────
export type TagCategory =
  | "genre"
  | "mood"
  | "trope"
  | "content_warning"
  | "setting"
  | "custom";

// ── Coins & Purchases ─────────────────────────────────────────
export type CoinSource =
  | "purchase"
  | "bonus"
  | "refund"
  | "chapter_unlock"
  | "subscription_reward";

export type PurchaseStatus = "pending" | "completed" | "refunded" | "failed";
export type SubTier = "basic" | "supporter" | "superfan";

// ── Ads ───────────────────────────────────────────────────────
export type AdPosition = "pre_chapter" | "mid_chapter" | "post_chapter";
export type AdType = "banner" | "interstitial" | "sponsored_text" | "google_injected";

// ── Earnings & Payouts ────────────────────────────────────────
export type PayoutMethod = "stripe" | "payoneer" | "wise";
export type TaxFormStatus = "not_submitted" | "pending" | "approved" | "rejected";
export type PayoutSchedule = "monthly" | "threshold";
export type EarningSource =
  | "ad_revenue"
  | "coin_sale"
  | "chapter_purchase"
  | "subscription";
export type PayoutStatus = "pending" | "processing" | "paid" | "failed";

// ── Reviews & Votes ───────────────────────────────────────────
export type VoteType = "helpful" | "unhelpful";

// ── Library ───────────────────────────────────────────────────
export type LibraryStatus = "reading" | "want_to_read" | "completed" | "dropped";

// ── Algorithm ─────────────────────────────────────────────────
export type SignalType =
  | "read_chapter"
  | "completed_book"
  | "abandoned_book"
  | "purchased_chapter"
  | "reviewed"
  | "shared"
  | "time_on_page"
  | "skipped_chapter"
  | "search_query"
  | "tag_clicked";

// ── Notifications ─────────────────────────────────────────────
// app/api/lib/types.ts — extend this union
export type NotificationType =
  | "comment_reply"
  | "new_comment"
  | "chapter_published"
  | "reading_reminder"
  | "book_completed_series"
  | "mention"
  | "new_chapter"
  | "new_review"
  | "review_vote"
  | "new_follower"
  | "payout_initiated"
  | "payout_completed"
  | "earnings_update"
  | "subscription_expiring"
  | "chapter_unlocked"
  | "admin_warning"   // new
  | "book_deleted"

// ── Sound Effects (JSONB shape) ───────────────────────────────
export interface SoundEffect {
  trigger: "scroll_pct" | "paragraph_id";
  value: number;
  url: string;
  volume: number; // 0.0 – 1.0
}