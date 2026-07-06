// app/write/[bookId]/page.tsx — only the changed parts shown
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { notFound, useParams, useRouter  } from "next/navigation";
import { ArrowLeft, PenSquare, Pencil, BookOpen, Star,Trash2 , Layers, Sparkles, Loader2 } from "lucide-react";
import { BookManageHeader } from "@/components/book-summary-card";
import { EditBookModal } from "@/components/edit-book-modal";
import { StatCard } from "@/components/stat-card";
import { ChapterPerformanceTable } from "@/components/chapter-performance-table";
import { ReviewList } from "@/components/review-list";
import {
  DashboardService,
  type BookManageDTO,
  type ChapterPerformanceDTO,
  type ManageReviewDTO,
} from "@/app/services/DashboardService";
import { formatCompactNumber } from "@/lib/format";
import { DeleteBookDialog } from "@/components/delete-book-dialog";


export default function BookManagePage() {
  const params = useParams<{ bookId: string }>();
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [book, setBook] = useState<BookManageDTO | null>(null);
  const [chapters, setChapters] = useState<ChapterPerformanceDTO[]>([]);
  const [reviews, setReviews] = useState<ManageReviewDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    DashboardService.getBookManage(params.bookId)
      .then(({ data }) => {
        console.log(data)
        if (cancelled) return;
        
        setBook(data.book);
        setChapters(data.chapters);
        setReviews(data.reviews);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err?.status === 404 || err?.status === 403 || err?.response?.status === 404) {
          setNotFoundState(true);
        }
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [params.bookId]);

  if (loading) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center gap-2 text-ink-muted">
        <Loader2 size={20} className="animate-spin" />
        <span className="font-sans text-sm">Loading book…</span>
      </main>
    );
  }

  if (notFoundState || !book) notFound();

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <Link href="/dashboard" className="mb-4 inline-flex items-center gap-1.5 font-sans text-sm text-ink-muted hover:text-ink">
        <ArrowLeft size={15} /> Back to dashboard
      </Link>

      <BookManageHeader book={book} />

      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={() => setEditOpen(true)}
          className="flex items-center gap-1.5 rounded-full border border-hairline px-4 py-2.5 font-sans text-sm font-medium text-ink transition hover:border-accent hover:text-accent"
        >
          <Pencil size={15} /> Edit book info
        </button>
        <button
          onClick={() => setDeleteOpen(true)}
          className="flex items-center gap-1.5 rounded-full border border-red-200 px-4 py-2.5 font-sans text-sm font-medium text-red-600 transition hover:border-red-400 hover:bg-red-50"
        >
          <Trash2 size={15} /> Delete
        </button>
        <Link
          href={`/write/${book._id}/editor`}
          className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-2.5 font-sans text-sm font-semibold text-accent-ink transition hover:opacity-90"
        >
          <PenSquare size={15} /> New chapter
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={BookOpen} label="Total reads" value={formatCompactNumber(book.totalReads)} />
        <StatCard icon={Layers} label="Chapters" value={String(book.totalChapters)} />
        <StatCard icon={Star} label="Avg. rating" value={book.reviewCount > 0 ? book.averageRating.toFixed(1) : "—"} />
        <div className="rounded-2xl border border-dashed border-hairline bg-surface/60 p-4">
          <div className="flex items-center gap-2 font-sans text-xs font-semibold uppercase tracking-wide text-ink-muted">
            <Sparkles size={14} className="text-accent" /> Earnings
          </div>
          <p className="mt-2 font-sans text-sm font-medium text-ink-muted">Coming soon</p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-hairline bg-surface p-5">
        <h2 className="font-display text-lg font-semibold text-ink">Chapters</h2>
        <div className="mt-4">
          <ChapterPerformanceTable bookId={book._id} chapters={chapters} />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-hairline bg-surface p-5">
        <h2 className="font-display text-lg font-semibold text-ink">Reader reviews</h2>
        <div className="mt-4">
          <ReviewList reviews={reviews} />
        </div>
      </div>

      {editOpen && (
        <EditBookModal
          book={book}
          onClose={() => setEditOpen(false)}
          onSaved={(updated) => setBook((prev) => (prev ? { ...prev, ...updated } : prev))}
        />
      )}
      {deleteOpen && book && (
        <DeleteBookDialog
          bookId={book._id}
          bookTitle={book.title}
          onClose={() => setDeleteOpen(false)}
          onDeleted={() => router.push("/dashboard")}
        />
      )}
    </main>
  );
}