import ApiClient from "@/app/ApiCore";
import type { Book } from "@/lib/types";

const api = new ApiClient();

export type BrowseSort = "popular" | "newest" | "rating" | "updated";
export type BrowseStatus = "all" | "ongoing" | "completed" | "hiatus";
export type BrowseMature = "include" | "exclude";

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface BrowseFilters {
  sort: BrowseSort;
  status: BrowseStatus;
  mature: BrowseMature;
}

export interface BrowseByTagResponse {
  tag: { name: string; slug: string };
  books: Book[];
  pagination: Pagination;
  filters: BrowseFilters;
}

export interface BrowseByTagParams {
  page?: number;
  limit?: number;
  sort?: BrowseSort;
  status?: BrowseStatus;
  mature?: BrowseMature;
}

export const BrowseService = {
  byTag: (tagSlug: string, params: BrowseByTagParams = {}) => {
    const query = new URLSearchParams();
    query.set("page", String(params.page ?? 1));
    query.set("limit", String(params.limit ?? 24));
    if (params.sort) query.set("sort", params.sort);
    if (params.status) query.set("status", params.status);
    if (params.mature) query.set("mature", params.mature);

    return api.get<{ success: boolean; data: BrowseByTagResponse }>(
      `/api/browse/${tagSlug}?${query.toString()}`
    );
  },
};