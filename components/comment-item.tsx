"use client";

import { useState } from "react";
import { MessageCircle, Heart } from "lucide-react";
import { CommentComposer } from "@/components/comment-composer";
import { CommentService, type CommentDTO } from "@/app/services/CommentService";
import { formatTimeAgo } from "@/lib/format-time-ago";

function Avatar({ name, url }: { name: string; url: string | null }) {
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt={name} className="h-8 w-8 shrink-0 rounded-full object-cover" />;
  }
  const initial = name.charAt(0).toUpperCase() || "?";
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/15 font-sans text-xs font-semibold text-accent">
      {initial}
    </div>
  );
}

export function CommentItem({
  comment,
  chapterId,
  isReply = false,
}: {
  comment: CommentDTO;
  chapterId: string;
  isReply?: boolean;
}) {
  const [liked, setLiked] = useState(comment.likedByMe);
  const [likesCount, setLikesCount] = useState(comment.likesCount);
  const [likePending, setLikePending] = useState(false);

  const [replying, setReplying] = useState(false);
  const [replies, setReplies] = useState<CommentDTO[]>([]);
  const [repliesLoaded, setRepliesLoaded] = useState(false);
  const [repliesOpen, setRepliesOpen] = useState(false);
  const [repliesPage, setRepliesPage] = useState(1);
  const [repliesHasMore, setRepliesHasMore] = useState(false);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [repliesCount, setRepliesCount] = useState(comment.repliesCount);

  async function handleToggleLike() {
    if (likePending) return;
    setLikePending(true);
    const prevLiked = liked;
    const prevCount = likesCount;
    setLiked(!prevLiked);
    setLikesCount(prevLiked ? prevCount - 1 : prevCount + 1);
    try {
      const { data } = await CommentService.toggleCommentLike(comment._id);
      setLiked(data.liked);
      setLikesCount(data.likesCount);
    } catch {
      setLiked(prevLiked);
      setLikesCount(prevCount);
    } finally {
      setLikePending(false);
    }
  }

  async function loadReplies(page: number) {
    setLoadingReplies(true);
    try {
      const { data } = await CommentService.getCommentReplies(comment._id, page, 2);
      setReplies((prev) => (page === 1 ? data.replies ?? [] : [...prev, ...(data.replies ?? [])]));
      setRepliesHasMore(data.hasMore);
      setRepliesPage(page);
      setRepliesLoaded(true);
    } finally {
      setLoadingReplies(false);
    }
  }

  function handleShowReplies() {
    setRepliesOpen(true);
    if (!repliesLoaded) loadReplies(1);
  }

  async function handlePostReply(content: string) {
    const { data } = await CommentService.postComment(chapterId, content, comment._id);
    setReplies((prev) => [...prev, data.comment]);
    setRepliesCount((c) => c + 1);
    setRepliesOpen(true);
    setRepliesLoaded(true);
    setReplying(false);
  }

  return (
    <div className={`comment-enter flex gap-3 ${!isReply ? "border border-hairline bg-surface" : " bg-accent-ink"} p-3 rounded-lg`}
    id={`comment-${comment._id}`}>
      <Avatar name={comment.user?.name ?? "Reader"} url={comment.user?.avatarUrl ?? null} />

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
        <span className="font-sans text-sm font-semibold text-ink">{comment.user?.name ?? "Reader"}</span>
        {comment.isAuthor && (
          <span className="rounded-full bg-accent/15 px-1.5 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-wide text-accent">
            Author
          </span>
        )}
        <span className="font-sans text-xs text-ink-muted">{formatTimeAgo(comment.createdAt)}</span>
      </div>

        <p className="mt-0.5 whitespace-pre-wrap font-sans text-sm text-ink">{comment.content}</p>

        <div className="mt-1.5 flex items-center gap-4">
          <button
            onClick={handleToggleLike}
            disabled={likePending}
            aria-pressed={liked}
            className={`flex items-center gap-1 font-sans text-xs font-medium transition ${
              liked ? "text-accent" : "text-ink-muted hover:text-accent"
            }`}
          >
            <Heart size={12} className={liked ? "fill-current" : ""} />
            {likesCount > 0 ? `  ${likesCount}` : ""}
          </button>

          {!isReply && (
            <button
              onClick={() => setReplying((v) => !v)}
              className="flex items-center gap-1 font-sans text-xs font-medium text-ink-muted transition hover:text-accent"
            >
              <MessageCircle size={12} /> Reply
            </button>
          )}
        </div>

        {replying && (
          <div className="mt-2">
            <CommentComposer
              placeholder={`Reply to ${comment.user?.name ?? "this comment"}…`}
              submitLabel="Reply"
              autoFocus
              onSubmit={handlePostReply}
              onCancel={() => setReplying(false)}
            />
          </div>
        )}

        {!isReply && repliesCount > 0 && !repliesOpen && (
          <button
            onClick={handleShowReplies}
            className="mt-2 font-sans text-xs font-semibold text-accent hover:underline"
          >
            View {repliesCount} {repliesCount === 1 ? "reply" : "replies"}
          </button>
        )}

        {!isReply && repliesOpen && (
          <div className="mt-3 flex flex-col gap-3 border-l border-hairline pl-4">
            {replies.map((reply) => (
              <CommentItem key={reply._id} comment={reply} chapterId={chapterId} isReply />
            ))}
            {loadingReplies && <p className="font-sans text-xs text-ink-muted">Loading…</p>}
            {!loadingReplies && repliesHasMore && (
              <button
                onClick={() => loadReplies(repliesPage + 1)}
                className="self-start font-sans text-xs font-semibold text-accent hover:underline"
              >
                Load more replies
              </button>
            )}
          </div>
        )}
      </div>
       <style jsx>{`
        .comment-enter {
          animation: comment-in 320ms ease-out;
        }
        @keyframes comment-in {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}