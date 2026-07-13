// app/services/PromoBannerService.ts
import ApiClient from "@/app/ApiCore";

const api = new ApiClient();
interface Envelope<T> { success: boolean; data: T; message?: string }

export type PromoBannerType = "books" | "announcement";
export interface PromoBook { title: string; coverUrl: string; href: string }

export interface PublicPromoBanner {
  id: string;
  type: PromoBannerType;
  heading: string;
  accent: string;
  bgColor: string;
  waveColor: string;
  books: PromoBook[];
  imageUrl: string | null;
  linkUrl: string | null;
  linkLabel: string | null;
  openInNewTab: boolean;
}

export const PromoBannerService = {
  list: () => api.get<Envelope<{ banners: PublicPromoBanner[] }>>("/api/promo-banners"),
};