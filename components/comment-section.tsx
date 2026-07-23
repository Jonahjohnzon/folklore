/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useState } from "react";
import { CommentComposer } from "@/components/comment-composer";
import { CommentItem } from "@/components/comment-item";
import { CommentService, type CommentDTO } from "@/app/services/CommentService";
import { useSnapshot } from "valtio";
import { store } from "@/app/store/userStore";

// If CommentDTO nests replies under a different key, adjust here.
function findCommentDeep(comments: CommentDTO[], id: string): boolean {
  for (const c of comments) {
    if (c._id === id) return true;
    const replies = (c as any).replies as CommentDTO[] | undefined;
    if (replies?.length && findCommentDeep(replies, id)) return true;
  }
  return false;
}

function getTargetIdFromHash(): string | null {
  if (typeof window === "undefined") return null;
  const match = window.location.hash.match(/^#comment-([a-zA-Z0-9]+)$/);
  return match ? match[1] : null;
}

export function CommentSection({ chapterId }: { chapterId: string }) {
  const [comments, setComments] = useState<CommentDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const pageRef = useRef(1);
  const currentUserId = useSnapshot(store)._id;
  const currentUserRole = useSnapshot(store).role;
  // Computed once at mount, not via effect — this is an initial value, not a sync.
  const [targetId] = useState(getTargetIdFromHash);
  const resolvedRef = useRef(false);

 async function load(pageToLoad: number) {
  if (pageToLoad === 1) setLoading(true);
  else setLoadingMore(true);
  try {
    const { data } = await CommentService.getChapterComments(chapterId, pageToLoad, 2);
    setComments((prev) => (pageToLoad === 1 ? data.comments ?? [] : [...prev, ...(data.comments ?? [])]));
    setTotal(data.total);
    setHasMore(data.hasMore);
    setPage(pageToLoad);
    pageRef.current = pageToLoad; // keep ref in sync
  } finally {
    setLoading(false);
    setLoadingMore(false);
  }
}

  useEffect(() => {
    resolvedRef.current = false;
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterId]);

  // Derived, not stateful — no setState needed to know where we stand.
  const found = targetId ? findCommentDeep(comments, targetId) : false;
  const searching = !!targetId && !found;
  const locating = searching && (loading || loadingMore || hasMore);
  const notFound = searching && !loading && !loadingMore && !hasMore;

  // Keep paging forward until the target comment shows up, or we run out of pages.
  // Only side effect here is calling load() (async) or touching the DOM — no direct setState.
  useEffect(() => {
    if (!targetId || loading || loadingMore || resolvedRef.current) return;

    if (found) {
      resolvedRef.current = true;
      requestAnimationFrame(() => {
        const el = document.getElementById(`comment-${targetId}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.classList.add("comment-highlight");
          setTimeout(() => el.classList.remove("comment-highlight"), 2500);
        }
      });
      return;
    }

    if (hasMore) {
      load(page + 1);
    } else {
      resolvedRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [found, targetId, hasMore, loading, loadingMore, page]);

  async function handlePostComment(content: string) {
    const { data } = await CommentService.postComment(chapterId, content, null);
    setComments((prev) => [data.comment, ...prev]);
    setTotal((t) => t + 1);
  }

  return (
    <section className="mt-10 border-t border-hairline pt-6">
      <h2 className="font-sans text-sm font-semibold text-ink">
        {total > 0 ? `${total} comment${total === 1 ? "" : "s"}` : "Comments"}
      </h2>

      <div className="mt-4">
        <CommentComposer onSubmit={handlePostComment} />
      </div>

      {locating && <p className="mt-4 font-sans text-xs text-ink-muted">Locating comment…</p>}
      {notFound && (
        <p className="mt-4 font-sans text-xs text-ink-muted">
          {"Couldn't find that comment — it may have been removed."}
        </p>
      )}

      <div className="mt-6 flex flex-col gap-6">
        {loading && <p className="font-sans text-sm text-ink-muted">Loading comments…</p>}

        {!loading && comments.length === 0 && (
          <p className="font-sans text-sm text-ink-muted">Be the first to comment.</p>
        )}

         {comments.map((comment) => (
          <CommentItem
            key={comment._id}
            comment={comment}
            chapterId={chapterId}
            currentUserId={currentUserId}
            currentUserRole={currentUserRole}
          />
        ))}

        {!loading && hasMore && !locating && (
          <button
          onClick={() => {
          if (loadingMore || loading) return; 
          load(pageRef.current + 1);
        }}
          disabled={loadingMore}
          className="self-start font-sans text-sm font-semibold text-accent transition-opacity duration-150 hover:underline disabled:opacity-50"
        >
          <span className="inline-block transition-opacity duration-150">
            {loadingMore ? "Loading…" : "Load more comments"}
          </span>
        </button>
        )}
      </div>

      <style jsx>{`
        :global(.comment-highlight) {
          animation: comment-flash 2.5s ease-out;
        }
        @keyframes comment-flash {
          0% {
            background-color: color-mix(in srgb, var(--accent) 18%, transparent);
            border-radius: 0.75rem;
          }
          100% {
            background-color: transparent;
          }
        }
      `}</style>
    </section>
  );
}