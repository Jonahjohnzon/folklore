export type ThemeName = "parchment" | "midnight" | "coppice" | "quartz";

export type ChapterAccess = "free" | "coins" | "purchase" | "subscriber_only";
export type BookStatus = "draft" | "ongoing" | "completed" | "hiatus" | "removed";

export interface Tag {
  id: string;
  name: string;
  slug: string;
  category: "genre" | "mood" | "trope" | "content_warning" | "setting" | "custom";
}

export interface CreatorLocks {
  theme: boolean; // reader must use the author's sheet theme
  font: boolean;  // reader must use the author's font
  sound: boolean; // reader can't turn the author's entrance sound off
}

export interface Author {
  id: string;
  penName: string;
  avatarUrl: string;
  followers: number;
}

export interface ChapterPresentation {
  sheetThemeId: string;
  soundId: string | null;
  fontId: string;
  fontSize: number;
  locks: CreatorLocks;
  pageTurnSoundId: string | null;
}

export interface Book {
  _id: string;
  id: string;
  slug: string;
  title: string;
  description: string;
  coverUrl: string;
  author: Author;
  status: BookStatus;
  tags: Tag[];
  language: string;          // added — BookSummaryCard renders this
  matureContent: boolean;
  totalReads: number;
  totalChapters: number;
  averageRating: number;
  reviewCount: number;
  publishedAt: string;       // added — used for "published X ago" and sorting
}

export interface Chapter {
  id: string;
  bookId: string;
  orderIndex: number;
  title: string;
  content: string;
  wordCount: number;
  accessType: "free" | "coins" | "purchase" | "subscriber_only";
  coinsRequired: number;
  publishedAt: string;
  presentation: ChapterPresentation;
}

export interface Review {
  id: string;
  bookId: string;
  username: string;
  avatarUrl: string;
  rating: number;
  body: string;
  helpfulVotes: number;
  createdAt: string;
}

// lib/types.ts (addition)
export interface ParagraphCommentMock {
  id: string;
  chapterId: string;
  paragraphIndex: number;
  username: string;
  avatarUrl: string;
  body: string;
  createdAt: string;
}


// lib/types.ts (additions)
export type ReactionType = "like" | "love" | "laugh" | "wow" | "sad";

export interface ParagraphCommentMock {
  id: string;
  chapterId: string;
  paragraphIndex: number;
  username: string;
  avatarUrl: string;
  body: string;
  reactions: Record<ReactionType, number>;
  parentId?: string; // present on replies
  createdAt: string;
}

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
  
// types/index.ts (or wherever your shared types live — append if it already exists)

export type UserMode = "reader" | "creator";

export type CreatorStatus = "not_applied" | "pending" | "active" | "suspended";

export type AccountStatus = "active" | "suspended" | "deleted";