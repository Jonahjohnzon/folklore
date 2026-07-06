export type Genre =
  | "Fantasy"
  | "Dark Fiction"
  | "Romance"
  | "Thriller"
  | "Sci-Fi"
  | "Historical"
  | "Mystery"
  | "Horror"
  | "Literary"
  | "Young Adult";

export type BookStatus = "ongoing" | "completed" | "hiatus";
export type AccessType = "free" | "coins" | "subscriber";

export interface Book {
  id: string;
  title: string;
  author: string;
  authorHandle: string;
  slug: string;
  genre: Genre;
  subGenre?: string;
  coverGradient: string;   // Tailwind gradient class
  coverEmoji: string;
  rating: number;
  reads: string;           // formatted "2.4M"
  chapters: number;
  status: BookStatus;
  isMature: boolean;
  badge?: "Hot" | "New" | "Free" | "Complete";
  synopsis: string;
  tags: string[];
  accessType: AccessType;
  libraryCount: string;
}

export interface Author {
  id: string;
  name: string;
  handle: string;
  initials: string;
  coverGradient: string;
  followers: string;
  genres: string[];
  quote: string;
  bookCount: number;
}

export interface GenreShelf {
  genre: string;
  count: string;
  books: Book[];
}