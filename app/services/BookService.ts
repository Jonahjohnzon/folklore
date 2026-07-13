import ApiClient from "@/app/ApiCore";
import type { BookStatus } from "@/lib/types";

const api = new ApiClient();

export interface Book {
  _id: string;
  authorId: string;
  title: string;
  slug: string;
  description?: string;
  coverUrl?: string | null;
  language: string;
  status: BookStatus;
  matureContent: boolean;
  totalReads: number;
  totalChapters: number;
  averageRating: number;
  reviewCount: number;
  tags: string[];
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  
}

// app/services/BookService.ts
export interface BookTheme {
  _id: string;
  bookId: string;
  fontFamily: string;
  fontSizeBase: number;
  lineHeight: number;
  bgColor: string;
  textColor: string;
  accentColor: string;
  linkColor: string;
  sheetThemeId: string;
  textureUrl?: string | null;
  locks: { theme: boolean; font: boolean; sound: boolean };
  bgMusicUrl?: string;
  bgMusicVolume: number;
  customCss?: string;
}

export interface CreateBookBody {
  title: string;
  description?: string;
  language?: string;
  status?: BookStatus;
  matureContent?: boolean;
  tags?: string[];
  coverUrl?: string;
  coverPublicId?: string;
}

export interface PublicChapterSummary {
  _id: string;
  orderIndex: number;
  title: string;
  wordCount: number;
  accessType: string; // now may come back as "free" when bypassed
  coinsRequired: number;
  unlocked: boolean; 
}

export interface PublicReview {
  id: string;
  username: string;
  avatarUrl: string | null;
  rating: number;
  body: string;
  helpfulVotes: number;
  unhelpfulVotes:number;
}

export interface PublicBook {
  _id: string;
  slug: string;
  title: string;
  description: string;
  coverUrl: string | null;
  status: BookStatus;
  matureContent: boolean;
  totalReads: number;
  totalChapters: number;
  averageRating: number;
  reviewCount: number;
  tags: { id: string; name: string; slug: string }[];
  author: { id: string; penName: string; avatarUrl: string | null; followers: number; username:string };
}

export interface BookAuthorDTO {
  username: string;
  penName: string;
}
 
export interface BookDTO {
  _id: string;
  title: string;
  slug: string;
  coverUrl: string | null;
  matureContent: boolean;
  totalReads: number;
  totalChapters: number;
  averageRating: number;
  reviewCount: number;
  status: "draft" | "ongoing" | "completed" | "hiatus" | "removed";
  author: BookAuthorDTO;
}


export type UpdateBookBody = Partial<CreateBookBody>;

export type UpdateBookThemeBody = Partial<Omit<BookTheme, "_id" | "bookId">>;

export const BookService = {
  create: (body: CreateBookBody) =>
    api.post<{ success: boolean; data: { book: Book } }>("/api/books", body),

  listMine: () => api.get<{ success: boolean; data: { books: Book[] } }>("/api/books"),

  get: (bookId: string) =>
    api.get<{ success: boolean; data: { book: Book } }>(`/api/books/${bookId}`),

  update: (bookId: string, body: UpdateBookBody) =>
    api.patch<{ success: boolean; data: { book: Book } }>(`/api/books/${bookId}`, body),

  remove: (bookId: string) => api.delete<{ success: boolean }>(`/api/books/${bookId}`),

  restore: (bookId: string) =>
    api.post<{ success: boolean; data: { book: Book } }>(`/api/books/${bookId}/restore`, {}),

  // Uploads straight to Cloudinary from the browser (signed by our backend,
  // see lib/cloudinary-client.ts), then just persists the resulting URL —
  // the image bytes never pass through our own server.
// app/services/BookService.ts
    uploadCover: (bookId: string, file: File) => {
      const formData = new FormData();
      formData.append("cover", file);
      return api.patch<{ success: boolean; data: { coverUrl: string; coverPublicId: string } }>(
        `/api/books/${bookId}/cover`,
        formData
      );
},
  getTheme: (bookId: string) =>
    api.get<{ success: boolean; data: { theme: BookTheme } }>(`/api/books/${bookId}/theme`),

  updateTheme: (bookId: string, body: UpdateBookThemeBody) =>
    api.patch<{ success: boolean; data: { theme: BookTheme } }>(
      `/api/books/${bookId}/theme`,
      body
    ),

    getBySlug: (slug: string) =>
    api.get<{ success: boolean; data: { book: PublicBook } }>(`/api/books/by-slug/${slug}`),

      getChaptersBySlug: (slug: string) =>
        api.get<{ success: boolean; data: { isAuthor: boolean; chapters: PublicChapterSummary[] } }>(
          `/api/books/by-slug/${slug}/chapters`
        ),

  getReviewsBySlug: (slug: string) =>
    api.get<{ success: boolean; data: { reviews: PublicReview[] } }>(
      `/api/books/by-slug/${slug}/reviews`
    ),
  getWorksForUser(username: string) {
    return api.get<{ data:{books: BookDTO[]} }>(`/api/pages/users/${username}/books`);
  },
  uploadCoverStandalone: (file: File) => {
    const formData = new FormData();
    formData.append("cover", file);
    return api.post<{ success: boolean; data: { coverUrl: string; coverPublicId: string } }>(
      "/api/uploads/cover",
      formData
    );
  },
};