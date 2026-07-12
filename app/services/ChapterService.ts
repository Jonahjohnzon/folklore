import ApiClient from "@/app/ApiCore";
import type { ChapterAccess } from "@/lib/types";
import { uploadImageToCloudinary } from "@/lib/cloudinary-client";

const api = new ApiClient();

export interface Chapter {
  _id: string;
  bookId: string;
  orderIndex: number;
  title: string;
  content?: string;
  wordCount: number;
  coverUrl?: string | null;
  accessType: ChapterAccess;
  coinsRequired: number;
  audioId?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateChapterBody {
  title: string;
  content?: string;
  accessType?: ChapterAccess;
  coinsRequired?: number;
  orderIndex?: number;
}

export interface UpdateChapterBody {
  title?: string;
  content?: string;
  accessType?: ChapterAccess;
  coinsRequired?: number;
  audioIntroUrl?: string | null;
  coverUrl?: string | null;
  orderIndex?: number;
}

export interface PublicChapterDetail {
  _id: string | null;
  bookId: string;
  orderIndex: number;
  title: string;
  content: string;
  wordCount: number;
  coverUrl: string | null;
  accessType: ChapterAccess;
  coinsRequired: number;
  audioId: string | null;
}

export interface UnlockResult {
  unlocked: boolean;
  newBalance: number | null;
  alreadyUnlocked?: boolean;
  alreadyFree?: boolean;
  isAuthor?: boolean;
}

export interface PublicChapterTheme {
  _id: string | null;
  bookId: string;
  fontFamily: string;
  fontSizeBase: number;
  lineHeight: number;
  bgColor: string;
  textColor: string;
  accentColor: string;
  linkColor: string;
  bgMusicUrl: string | null;
  bgMusicVolume: number;
  customCss: string | null;
}


export const ChapterService = {
  create: (bookId: string, body: CreateChapterBody) =>
    api.post<{ success: boolean; data: { chapter: Chapter } }>(
      `/api/books/${bookId}/chapters`,
      body
    ),

  list: (bookId: string) =>
    api.get<{ success: boolean; data: { chapters: Chapter[] } }>(
      `/api/books/${bookId}/chapters`
    ),

  get: (bookId: string, chapterId: string) =>
    api.get<{ success: boolean; data: { chapter: Chapter } }>(
      `/api/books/${bookId}/chapters/${chapterId}`
    ),

  update: (bookId: string, chapterId: string, body: UpdateChapterBody) =>
    api.patch<{ success: boolean; data: { chapter: Chapter } }>(
      `/api/books/${bookId}/chapters/${chapterId}`,
      body
    ),

  remove: (bookId: string, chapterId: string) =>
    api.delete<{ success: boolean }>(`/api/books/${bookId}/chapters/${chapterId}`),

  publish: (bookId: string, chapterId: string) =>
    api.post<{ success: boolean; data: { chapter: Chapter } }>(
      `/api/books/${bookId}/chapters/${chapterId}/publish`,
      {}
    ),

  // Same pattern as BookService.uploadCover: upload straight to Cloudinary
  // from the browser, then persist just the resulting URL.
  uploadCover: async (bookId: string, chapterId: string, file: File) => {
    const coverUrl = await uploadImageToCloudinary(file, `books/${bookId}/chapters/${chapterId}/cover`);
    return api.patch<{ success: boolean; data: { chapter: Chapter } }>(
      `/api/books/${bookId}/chapters/${chapterId}`,
      { coverUrl }
    );
  },
  getPublicBySlug: (bookSlug: string, chapterId: string) =>
    api.get<{
      success: boolean;
      data: { chapter: PublicChapterDetail; prevId: string | null; nextId: string | null; theme: PublicChapterTheme };
    }>(`/api/books/by-slug/${bookSlug}/chapters/${chapterId}`),

    getLikeStatus(chapterId: string) {
    return api.get<{ data:{liked: boolean; likesCount: number} }>(`/api/chapters/${chapterId}/like`);
    },
 
    toggleLike(chapterId: string) {
    return api.post<{ data:{liked: boolean; likesCount: number} }>(`/api/chapters/${chapterId}/like`);
    },
  unlock(chapterId: string) {
    return api.post<{ data: UnlockResult }>(`/api/chapters/${chapterId}/unlock`, {});
  },
  getUnlockStatus(chapterId: string) {
    return api.get<{ data: { unlocked: boolean } }>(`/api/chapters/${chapterId}/unlock`);
  },
 
};