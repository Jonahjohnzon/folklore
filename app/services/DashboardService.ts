import ApiClient from "@/app/ApiCore";

const api = new ApiClient();

export interface CreatorBookDTO {
  _id: string;
  title: string;
  slug: string;
  coverUrl: string | null;
  status: "draft" | "ongoing" | "completed";
  totalReads: number;
  totalChapters: number;
  averageRating: number;
  reviewCount: number;
  updatedAt: string;
}

export interface DashboardStats {
 totalReads: number;
  totalChapters: number;
  totalBooks: number;
  avgRating: number;
  followerCount: number;
}

export interface ChapterPerformanceDTO {
  _id: string;
  title: string;
  orderIndex: number;
  wordCount: number;
  publishedAt: string | null;
  accessType: string;
  coinsRequired: number;
}
export type EditableBookStatus = "draft" | "ongoing" | "completed";


export interface BookManageDTO {
  _id: string;
  title: string;
  slug: string;
  description: string;
  coverUrl: string | null;
  status: EditableBookStatus | "removed"; // widened — a removed book can reach this page (e.g. via direct link) before purge
  language: string;
  matureContent: boolean;
  tags: string[];
  totalReads: number;
  totalChapters: number;
  averageRating: number;
  reviewCount: number;
  deletedAt: string | null; // null unless status === "removed"
}

export interface BookCompletionDTO {
  bookId: string;
  title: string;
  readers: number;
  finishers: number;
  rate: number; // percent, 0–100
}

export interface ManageReviewDTO {
  id: string;
  username: string;
  avatarUrl: string | null;
  rating: number;
  body: string;
  createdAt: string;
}
export interface DashboardAnalytics {
  range: number;
  readsByDay: { date: string; reads: number }[];
  earningsByDay: { date: string; coins: number }[];
  followersByDay: { date: string; followers: number }[];
  totalEarnings: number;
  earningsTrendPct: number;
  readsInstrumented: boolean;
  overallCompletionRate: number;
  bookCompletionRates: BookCompletionDTO[];
  topChapters: { chapterId: string; title: string; bookTitle: string; coins: number; unlocks: number }[];
}

export const DashboardService = {
  getOverview: () =>
    api.get<{ data:{stats: DashboardStats; books: CreatorBookDTO[]} }>("/api/creator/dashboard"),
  getBookManage: (bookId: string) =>
    api.get<{data:{ book: BookManageDTO; chapters: ChapterPerformanceDTO[]; reviews: ManageReviewDTO[]} }>(
      `/api/creator/books/${bookId}`
    ),
     getAnalytics: (range: 7 | 30 | 90 = 30) =>
    api.get<{ data: DashboardAnalytics }>("/api/creator/dashboard/analytics", { range: String(range) }),

};