// app/services/HomeService.ts
import ApiClient from "@/app/ApiCore";
import type { Book } from "@/lib/types";

const api = new ApiClient();

export interface ContinueReadingItem extends Book {
  chapterId: string;
  chapterTitle: string;
  progressPct: number;
}

export interface HomeFeed {
  needsOnboarding: boolean; // ← add this
  continueReading: ContinueReadingItem | null;
  personalized: Book[];
  personalizedIsFallback: boolean;
  trending: Book[];
  newReleases: Book[];
  fantasy: Book[];
  romance: Book[];
}



export const HomeService = {
  getFeed: () => api.get<{ data: HomeFeed }>("/api/home"),
};