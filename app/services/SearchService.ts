// app/services/SearchService.ts
import ApiClient from "@/app/ApiCore";

const api = new ApiClient();

export interface SearchBookResult {
  _id: string;
  title: string;
  slug: string;
  coverUrl: string | null;
  authorName: string;
}

export interface SearchAuthorResult {
  username: string;
  displayName: string;
  avatarUrl: string | null;
  penName: string | null;
  isCreator: boolean;
}

export interface SearchTagResult {
  name: string;
  slug: string;
  category: string;
}

export interface SearchResults {
  books: SearchBookResult[];
  authors: SearchAuthorResult[];
  tags: SearchTagResult[];
}

// app/services/SearchService.ts (additions)
export interface SearchSection<T> {
  items: T[];
  total: number;
}

export interface FullSearchResults {
  query: string;
  tab: "all" | "books" | "authors" | "tags";
  page: number;
  pageSize: number;
  books: SearchSection<SearchBookResult & { description: string | null }>;
  authors: SearchSection<SearchAuthorResult & { bio: string | null }>;
  tags: SearchSection<SearchTagResult & { usageCount: number }>;
}

// add to the existing SearchService object:

export const SearchService = {
  search: (q: string) => api.get<{ data: SearchResults }>("/api/search", { q }),
  fullSearch: (q: string, opts?: { type?: string; page?: number }) =>
  api.get<{ data: FullSearchResults }>("/api/search/full", {
    q,
    type: opts?.type ?? "all",
    page: opts?.page ?? 1,
  })
};