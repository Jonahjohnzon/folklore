import ApiClient from "@/app/ApiCore";
const api = new ApiClient();

export type LibraryStatus = "reading" | "want_to_read" | "completed" | "dropped";

export interface LibraryBookSummary {
  title: string;
  slug: string;
  coverUrl: string | null;
}

export interface LibraryEntryDTO {
  bookId: string;
  status: LibraryStatus;
  addedAt: string;
  updatedAt: string;
  book: LibraryBookSummary;
}

export interface LibraryCounts {
  reading: number;
  want_to_read: number;
  completed: number;
  dropped: number;
  all: number;
}

export interface HistoryEntryDTO {
  chapterId: string;
  chapterOrderIndex: number;
  chapterTitle: string;
  chapterProgressPct: number; // scroll % within this specific chapter
  bookProgressPct: number;    // chapterOrderIndex / totalChapters, book-level
  completed: boolean;
  lastReadAt: string;
  book: {
    slug: string;
    title: string;
    coverUrl: string | null;
  };
}
export const LibraryService = {
    getEntries(status?: LibraryStatus) {
      return api.get<{ data: { entries: LibraryEntryDTO[] } }>(
        "/api/library",
        status ? { status } : {}
      );
    },

  getCounts() {
    return api.get<{ data:{counts: LibraryCounts} }>("/api/library/counts");
  },

  setStatus(bookId: string, status: LibraryStatus) {
    return api.put<{ data:{bookId: string; status: LibraryStatus; addedAt: string; updatedAt: string} }>(
      `/api/library/${bookId}`,
      { status }
    );
  },

  remove(bookId: string) {
    return api.delete<{ removed: boolean }>(`/api/library/${bookId}`);
  },

  getHistory() {
    return api.get<{ data:{entries: HistoryEntryDTO[] }}>("/api/history");
  },

  recordProgress(chapterId: string, progressPct: number, completed: boolean) {
    return api.post<{ data:{saved: boolean; libraryStatus: LibraryStatus | null} }>(
      `/api/chapters/${chapterId}/progress`,
      { progressPct, completed }
    );
  },
  getStatus: (bookId: string) =>
    api.get<{ data:{status: LibraryStatus | null} }>(`/api/library/${bookId}/wishlist`),
  toggleWishlist: (bookId: string) =>
    api.post<{ data:{status: LibraryStatus | null} }>(`/api/library/${bookId}/wishlist`),
};