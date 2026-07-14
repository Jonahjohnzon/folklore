/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Star, BookOpen, Heart, Share2, Lock, Coins, Play, ArrowLeft, Loader2, BookX,
} from "lucide-react";
import {
  BookService,
  type PublicBook,
  type PublicChapterSummary,
  type PublicReview,
} from "@/app/services/BookService";
import { LibraryService, type LibraryStatus } from "@/app/services/LibraryService";
import { ReviewService } from "@/app/services/ReviewService";
import { CoinService } from "@/app/services/coinService";
import ChapterUnlockModal from "@/components/ChapterUnlockModal";
import { useRouter } from "nextjs-toploader/app";
import { useSnapshot } from "valtio";
import { store } from "@/app/store/userStore";
import { Avatar } from "@/components/avatar";

function formatReads(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M reads`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K reads`;
  return `${n} reads`;
}

export default function BookDetailPage() {
  const [eligible, setEligible] = useState<boolean | null>(null); // null = not checked yet (logged out or loading)
  const [myRating, setMyRating] = useState(0);
  const [myBody, setMyBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [voteBusyId, setVoteBusyId] = useState<string | null>(null);
  const params = useParams<{ slug: string }>();
  const [libraryStatus, setLibraryStatus] = useState<LibraryStatus | null>(null);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [book, setBook] = useState<PublicBook | null>(null);
  const [chapters, setChapters] = useState<PublicChapterSummary[]>([]);
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coinBalance, setCoinBalance] = useState<number | null>(null);
  const [unlockTarget, setUnlockTarget] = useState<PublicChapterSummary | null>(null);
  const [isAuthor, setIsAuthor] = useState(false);
  const router = useRouter();
  const { _id: userId, authChecked } = useSnapshot(store);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setNotFoundState(false);

    Promise.all([
      BookService.getBySlug(params.slug),
      BookService.getChaptersBySlug(params.slug),
      BookService.getReviewsBySlug(params.slug),
    ])
      .then(([bookRes, chaptersRes, reviewsRes]) => {
        if (cancelled) return;
        setBook(bookRes.data.book);
        setChapters(chaptersRes.data.chapters);
        setIsAuthor(chaptersRes.data.isAuthor);
        setReviews(reviewsRes.data.reviews);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err?.status === 404 || err?.response?.status === 404) setNotFoundState(true);
        else setError(err instanceof Error ? err.message : "Couldn't load this book.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [params.slug]);

  useEffect(() => {
    CoinService.getBalance()
      .then((res) => {
        if (res?.data?.coinBalance) {
          setCoinBalance(res.data.coinBalance);
        }
      })
      .catch(() => setCoinBalance(0));
  }, []);

  useEffect(() => {
    if (!book) return;
    let cancelled = false;
    LibraryService.getStatus(book._id)
      .then(({ data }) => !cancelled && setLibraryStatus(data.status))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [book]);

  useEffect(() => {
    ReviewService.getEligibility()
      .then((res) => setEligible(res.data.eligible))
      .catch(() => setEligible(false)); // 401 if logged out — treat as not eligible, not an error state
  }, []);

  // Gate any Link/button that requires auth: prevents navigation until the
  // initial auth check resolves, then redirects to /sign-in if logged out.
  function requireAuth(e: React.MouseEvent) {
    if (!authChecked) {
      e.preventDefault();
      return;
    }
    if (!userId) {
      e.preventDefault();
      router.push("/sign-in");
    }
  }

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!book || myRating === 0) return;
    setSubmitting(true);
    try {
      const { data } = await ReviewService.submit(book.slug, myRating, myBody);
      setReviews((prev) => {
        const withoutMine = prev.filter((r) => r.id !== data.review._id);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return [{ ...data.review, id: String(data.review._id) } as any, ...withoutMine];
      });
      setMyBody("");
    } catch {
      // surface via a toast if you have one — omitted here
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVote(reviewId: string, vote: "helpful" | "unhelpful") {
    setVoteBusyId(reviewId);
    try {
      const { data } = await ReviewService.vote(reviewId, vote);
      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, helpfulVotes: data.helpfulVotes, unhelpfulVotes: data.unhelpfulVotes } : r))
      );
    } catch {
      // ignore — likely 403 (not eligible) or already-voted race
    } finally {
      setVoteBusyId(null);
    }
  }

  async function handleWishlistToggle() {
    if (!book || wishlistLoading) return;
    if (!authChecked) return;
    if (!userId) {
      router.push("/sign-in");
      return;
    }
    setWishlistLoading(true);
    try {
      const { data } = await LibraryService.toggleWishlist(book._id);
      setLibraryStatus(data.status);
    } catch {
    } finally {
      setWishlistLoading(false);
    }
  }

  async function handleShare() {
    if (!book) return;
    const url = `${window.location.origin}/book/${book.slug}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: book.title, url });
      } catch {
        // user closed the native share sheet — not an error
      }
    } else {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center gap-2 text-ink-muted">
        <Loader2 size={20} className="animate-spin" />
        <span className="font-sans text-sm">Loading book…</span>
      </main>
    );
  }

  if (notFoundState || !book) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-ink-muted">
        <BookX size={28} />
        <p className="font-sans text-sm">{"This book doesn't exist or isn't available."}</p>
        <Link href="/" className="font-sans text-sm font-medium text-accent hover:underline">
          Back home
        </Link>
      </main>
    );
  }

  return (
    <main className="pb-20">
      {/* Banner */}
      <div className="relative h-32 w-full overflow-hidden sm:h-32">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={book.coverUrl ?? ""} alt="" className="h-full w-full scale-100 object-cover blur-xs brightness-50" />
        <div className="absolute inset-0 bg-linear-to-t from-bg via-bg/40 to-bg/10" />

        <Link
          href="/"
          aria-label="Back to home"
          className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-bg/70 text-ink backdrop-blur-sm transition hover:bg-bg/90"
        >
          <ArrowLeft size={18} />
        </Link>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {error && (
          <div className="mt-4 rounded-lg border border-red-300 bg-red-50 px-3.5 py-2 font-sans text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          {/* Cover + actions */}
          <div>
            <div className="mx-auto w-44 sm:w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={book.coverUrl ?? ""}
                alt={book.title}
                className="aspect-2/3 w-full rounded-xl border border-hairline object-cover shadow-2xl"
              />
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <button
                onClick={() => {
                  if (!authChecked) return;
                  if (!userId) {
                    router.push("/sign-in");
                    return;
                  }
                  router.push(`/book/${book.slug}/chapter/${chapters[0]?._id ?? ""}`);
                }}
                className="flex w-full items-center justify-center gap-1.5 rounded-full bg-accent px-4 py-2.5 font-sans text-sm font-semibold text-accent-ink transition hover:opacity-90"
              >
                <Play size={15} /> Start reading
              </button>

              <div className="flex gap-2">
                <button
                  onClick={handleWishlistToggle}
                  disabled={wishlistLoading || (libraryStatus !== null && libraryStatus !== "want_to_read")}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-full border py-2.5 font-sans text-sm font-medium transition ${
                    libraryStatus
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-hairline text-ink hover:border-accent hover:text-accent"
                  } disabled:opacity-60`}
                >
                  <Heart size={15} className={libraryStatus === "want_to_read" ? "fill-accent" : ""} />
                  {libraryStatus === "want_to_read" ? "In your library" : libraryStatus ? "Already reading" : "Add to library"}
                </button>
                <button
                  aria-label="Share"
                  onClick={handleShare}
                  className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-hairline text-ink-muted transition hover:border-accent hover:text-accent"
                >
                  <Share2 size={15} />
                  {shareCopied && (
                    <span className="absolute -top-8 whitespace-nowrap rounded-md bg-ink px-2 py-1 font-sans text-[11px] text-bg">
                      Link copied
                    </span>
                  )}
                </button>
              </div>
            </div>

            <Link
              href={`/u/${book.author.username}`}
              onClick={requireAuth}
              className="mt-5 flex items-center gap-3 rounded-xl border border-hairline bg-surface p-3"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
                      <Avatar avatarUrl={book.author.avatarUrl || null} name={book.author.penName} size={40} />

              <div>
                <p className="font-sans text-sm font-semibold text-ink">{book.author.penName}</p>
                <p className="font-sans text-xs text-ink-muted">@{book.author.username}</p>
              </div>
            </Link>
          </div>

          {/* Details */}
          <div className="pt-2 lg:pt-8">
            <span className="font-sans text-xs font-semibold uppercase tracking-wide text-accent">
              {book.status.replace("_", " ")}
            </span>
            <h1 className="mt-1.5 font-display text-2xl font-bold leading-tight text-ink sm:text-4xl">{book.title}</h1>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 font-sans text-sm text-ink-muted">
              <span className="flex items-center gap-1">
                <Star size={14} className="fill-gold text-gold" />
                {book.averageRating.toFixed(1)} ({book.reviewCount.toLocaleString()} reviews)
              </span>
              <span className="flex items-center gap-1">
                <BookOpen size={14} /> {formatReads(book.totalReads)}
              </span>
              <span>{book.totalChapters} chapters</span>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {book.tags.map((t) => (
                <Link
                  key={t.id}
                  href={`/browse/${t.slug}`}
                  className="rounded-full border border-hairline px-2.5 py-1 font-sans text-xs font-medium text-ink-muted hover:border-accent hover:text-accent"
                >
                  {t.name}
                </Link>
              ))}
            </div>

            <p className="prose-reader mt-5 max-w-2xl text-ink">{book.description}</p>

            {/* Chapters */}
            <h2 className="mt-10 font-display text-xl font-semibold text-ink">Chapters</h2>
            <div className="mt-3 divide-y divide-hairline overflow-hidden rounded-xl border border-hairline bg-surface">
              {chapters.length === 0 && (
                <p className="px-4 py-6 font-sans text-sm text-ink-muted">No chapters published yet.</p>
              )}
              {unlockTarget && (
                <ChapterUnlockModal
                  bookSlug={book.slug}
                  chapterId={unlockTarget._id}
                  chapterTitle={unlockTarget.title}
                  coinsRequired={unlockTarget.coinsRequired}
                  currentBalance={coinBalance}
                  onClose={() => setUnlockTarget(null)}
                  onUnlocked={(newBalance) => {
                    if (newBalance !== null) setCoinBalance(newBalance);
                    setUnlockTarget(null);
                  }}
                />
              )}
              {chapters.map((c) => {
                const locked = !c.unlocked;

                const commonInner = (
                  <>
                    <div className="min-w-0">
                      <p className="truncate font-sans text-sm font-medium text-ink">
                        {c.orderIndex}. {c.title}
                      </p>
                      <p className="font-sans text-xs text-ink-muted">{c.wordCount.toLocaleString()} words</p>
                    </div>
                    {locked ? (
                      <span className="flex shrink-0 items-center gap-1 rounded-full bg-bg px-2.5 py-1 font-sans text-xs font-semibold text-gold">
                        <Coins size={12} /> {c.coinsRequired}
                      </span>
                    ) : (
                      <Lock size={0} />
                    )}
                  </>
                );

                if (locked) {
                  return (
                    <button
                      key={c._id}
                      onClick={() => {
                        if (!authChecked) return;
                        if (!userId) {
                          router.push("/sign-in");
                          return;
                        }
                        setUnlockTarget(c);
                      }}
                      className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-bg"
                    >
                      {commonInner}
                    </button>
                  );
                }

                return (
                  <Link
                    key={c._id}
                    href={`/book/${book.slug}/chapter/${c._id}`}
                    onClick={requireAuth}
                    className="flex items-center justify-between gap-3 px-4 py-3 transition hover:bg-bg"
                  >
                    {commonInner}
                  </Link>
                );
              })}
            </div>

            {/* Reviews */}
            <h2 className="mt-10 font-display text-xl font-semibold text-ink">Reader reviews</h2>

            {eligible === true && (
              <form onSubmit={handleSubmitReview} className="mt-3 rounded-xl border border-hairline bg-surface p-4">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <button key={i} type="button" onClick={() => setMyRating(i + 1)} aria-label={`Rate ${i + 1} stars`}>
                      <Star size={18} className={i < myRating ? "fill-gold text-gold" : "text-hairline"} />
                    </button>
                  ))}
                </div>
                <textarea
                  value={myBody}
                  onChange={(e) => setMyBody(e.target.value)}
                  placeholder="Share what you thought…"
                  rows={3}
                  className="mt-2 w-full resize-none rounded-lg border border-hairline bg-transparent px-3 py-2 font-sans text-sm text-ink"
                />
                <button
                  type="submit"
                  disabled={submitting || myRating === 0}
                  className="mt-2 rounded-full bg-accent px-4 py-2 font-sans text-sm font-semibold text-accent-ink disabled:opacity-50"
                >
                  {submitting ? "Posting…" : "Post review"}
                </button>
              </form>
            )}

            {eligible === false && (
              <p className="mt-3 font-sans text-xs text-ink-muted">
                {"Reviewing is limited to readers who've reached a top-tier reading or streak badge."}
              </p>
            )}

            <div className="mt-3 space-y-3">
              {reviews.length === 0 && <p className="font-sans text-sm text-ink-muted">No reviews yet.</p>}
              {reviews.map((r) => (
                <div key={r.id} className="rounded-xl border border-hairline bg-surface p-4">
                  <div className="flex items-center gap-2.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={r.avatarUrl ?? ""} alt={r.username} className="h-8 w-8 rounded-full object-cover" />
                    <div>
                      <p className="font-sans text-sm font-semibold text-ink">{r.username}</p>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={11} className={i < r.rating ? "fill-gold text-gold" : "text-hairline"} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="prose-reader mt-2.5 text-sm text-ink">{r.body}</p>
                  {/* {eligible === true && (
                    <div className="mt-2 flex items-center gap-3">
                      <button
                        onClick={() => handleVote(r.id, "helpful")}
                        disabled={voteBusyId === r.id}
                        className="font-sans text-xs text-ink-muted hover:text-accent disabled:opacity-50"
                      >
                        Helpful ({r.helpfulVotes})
                      </button>
                      <button
                        onClick={() => handleVote(r.id, "unhelpful")}
                        disabled={voteBusyId === r.id}
                        className="font-sans text-xs text-ink-muted hover:text-accent disabled:opacity-50"
                      >
                        Not helpful ({r.unhelpfulVotes})
                      </button>
                    </div>
                  )} */}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}