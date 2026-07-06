"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Loader2, BookX } from "lucide-react";
import { ChapterReader } from "@/components/chapter-reader";
import { BookService } from "@/app/services/BookService";
import { ChapterService, type PublicChapterDetail, type PublicChapterTheme } from "@/app/services/ChapterService";
import { SignalService } from "@/app/services/SignalService";

export default function ChapterPage() {
  const params = useParams<{ slug: string; chapterId: string }>();

  const [bookTitle, setBookTitle] = useState<string | null>(null);
  const [chapter, setChapter] = useState<PublicChapterDetail | null>(null);
  const [theme, setTheme] = useState<PublicChapterTheme | null>(null);
  const [prevId, setPrevId] = useState<string | null>(null);
  const [nextId, setNextId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setNotFoundState(false);

    Promise.all([
      BookService.getBySlug(params.slug),
      ChapterService.getPublicBySlug(params.slug, params.chapterId),
    ])
      .then(([bookRes, chapterRes]) => {
        if (cancelled) return;
        
        setBookTitle(bookRes.data.book.title);
        setChapter(chapterRes.data.chapter);
        setPrevId(chapterRes.data.prevId);
        setNextId(chapterRes.data.nextId);
        setTheme(chapterRes.data.theme);
      SignalService.log("read_chapter", {
      bookId: bookRes.data.book._id,
      chapterId: chapterRes.data.chapter._id || undefined,
    });
      })
      .catch((err) => {
        if (cancelled) return;
        if (err?.status === 404 || err?.response?.status === 404) setNotFoundState(true);
        else setError(err instanceof Error ? err.message : "Couldn't load this chapter.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [params.slug, params.chapterId]);

  if (loading) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center gap-2 text-ink-muted">
        <Loader2 size={20} className="animate-spin" />
        <span className="font-sans text-sm">Loading chapter…</span>
      </main>
    );
  }

  if (notFoundState || !chapter || !bookTitle) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-ink-muted">
        <BookX size={28} />
        <p className="font-sans text-sm">{error ?? "This chapter doesn't exist or isn't available."}</p>
        <Link href={`/book/${params.slug}`} className="font-sans text-sm font-medium text-accent hover:underline">
          Back to book
        </Link>
      </main>
    );
  }

  return (
    <ChapterReader
      bookSlug={params.slug}
      bookTitle={bookTitle}
      chapter={chapter}
      theme={theme}
      prevId={prevId ?? undefined}
      nextId={nextId ?? undefined}
    />
  );
}