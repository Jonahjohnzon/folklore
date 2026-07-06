// app/services/ReviewService.ts
import ApiClient from "@/app/ApiCore";

const api = new ApiClient();

export interface ReviewDTO {
  _id: string;
  userId: string;
  username: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  rating: number;
  body: string;
  helpfulVotes: number;
  unhelpfulVotes: number;
  verifiedReader: boolean;
  isPinned: boolean;
  createdAt: string;
}

interface Envelope<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const ReviewService = {
  getForBook: (slug: string) => api.get<Envelope<{ reviews: ReviewDTO[] }>>(`/api/pages/books/${slug}/reviews`),
  submit: (slug: string, rating: number, body: string) =>
    api.post<Envelope<{ review: ReviewDTO }>>(`/api/pages/books/${slug}/reviews`, { rating, body }),
  vote: (reviewId: string, vote: "helpful" | "unhelpful") =>
    api.post<Envelope<{ helpfulVotes: number; unhelpfulVotes: number }>>(`/api/pages/reviews/${reviewId}/vote`, { vote }),
  getEligibility: () => api.get<Envelope<{ eligible: boolean }>>("/api/pages/reviews/eligibility"),
};