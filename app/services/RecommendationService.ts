import ApiClient from "@/app/ApiCore";

const api = new ApiClient();

export interface RecommendedBookDTO {
  _id: string;
  title: string;
  slug: string;
  coverUrl: string | null;
  matureContent: boolean;
  totalReads: number;
  totalChapters: number;
  averageRating: number;
  reviewCount: number;
  author: { username: string; penName: string };
}

export const RecommendationService = {
  getForBook: (bookId: string, limit = 10) =>
    api.get<{ success: boolean; data: { books: RecommendedBookDTO[] } }>(
      `/api/books/${bookId}/recommendations?limit=${limit}`
    ),
};