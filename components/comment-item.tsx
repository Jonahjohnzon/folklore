"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageCircle, Heart, Pencil, Trash2, X, Check, ShieldAlert } from "lucide-react";
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
  currentUserId,
  currentUserRole,
}: {
  comment: CommentDTO;
  chapterId: string;
  isReply?: boolean;
  currentUserId?: string | null;
  currentUserRole?: "user" | "moderator" | "admin";
}) {
  const [content, setContent] = useState(comment.content);
  const [edited, setEdited] = useState(comment.edited);
  const [deleted, setDeleted] = useState(false);

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

  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(comment.content);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const isOwner = Boolean(currentUserId && comment.user?._id === currentUserId);
  const isModerator = currentUserRole === "moderator" || currentUserRole === "admin";
  const canDelete = isOwner || isModerator;

  const displayName = comment.user?.name ?? "Reader";
  const profileHref = comment.user?.name ? `/u/${comment.user.name}` : null;

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

  async function handlePostReply(replyContent: string) {
    const { data } = await CommentService.postComment(chapterId, replyContent, comment._id);
    setReplies((prev) => [...prev, data.comment]);
    setRepliesCount((c) => c + 1);
    setRepliesOpen(true);
    setRepliesLoaded(true);
    setReplying(false);
  }

  async function handleSaveEdit() {
    const trimmed = editValue.trim();
    if (!trimmed || saving) return;
    setSaving(true);
    setActionError(null);
    try {
      const { data } = await CommentService.updateComment(comment._id, trimmed);
      setContent(data.comment.content);
      setEdited(data.comment.edited);
      setEditing(false);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Couldn't save your edit.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (deleting) return;
    const message = isOwner
      ? "Delete this comment? This can't be undone."
      : "Remove this comment as a moderator? This can't be undone.";
    if (!window.confirm(message)) return;
    setDeleting(true);
    setActionError(null);
    try {
      await CommentService.deleteComment(comment._id);
      setDeleted(true);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Couldn't delete comment.");
      setDeleting(false);
    }
  }

  if (deleted) {
    return (
      <div
        className={`flex gap-3 ${!isReply ? "border border-hairline bg-surface" : "bg-accent-ink"} p-3 rounded-lg`}
        id={`comment-${comment._id}`}
      >
        <p className="font-sans text-sm italic text-ink-muted">Comment deleted.</p>
      </div>
    );
  }

  return (
    <div
      className={`comment-enter flex gap-3 ${!isReply ? "border border-hairline bg-surface" : " bg-accent-ink"} p-3 rounded-lg`}
      id={`comment-${comment._id}`}
    >
      {profileHref ? (
        <Link href={profileHref} className="shrink-0">
          <Avatar name={displayName} url={comment.user?.avatarUrl ?? null} />
        </Link>
      ) : (
        <Avatar name={displayName} url={comment.user?.avatarUrl ?? null} />
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          {profileHref ? (
            <Link href={profileHref} className="font-sans text-sm font-semibold text-ink hover:text-accent hover:underline">
              {displayName}
            </Link>
          ) : (
            <span className="font-sans text-sm font-semibold text-ink">{displayName}</span>
          )}
          {comment.isAuthor && (
            <span className="rounded-full bg-accent/15 px-1.5 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-wide text-accent">
              Author
            </span>
          )}
          <span className="font-sans text-xs text-ink-muted">{formatTimeAgo(comment.createdAt)}</span>
          {edited && <span className="font-sans text-xs text-ink-muted">(edited)</span>}
        </div>

        {editing ? (
          <div className="mt-1.5">
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value.slice(0, 1000))}
              rows={3}
              autoFocus
              className="w-full resize-none rounded-lg border border-hairline bg-bg px-3 py-2 font-sans text-sm text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
            {actionError && <p className="mt-1 font-sans text-xs text-red-600">{actionError}</p>}
            <div className="mt-1.5 flex items-center gap-3">
              <button
                onClick={handleSaveEdit}
                disabled={saving || !editValue.trim()}
                className="flex items-center gap-1 font-sans text-xs font-semibold text-accent hover:underline disabled:opacity-50"
              >
                <Check size={12} /> {saving ? "Saving…" : "Save"}
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setEditValue(content);
                  setActionError(null);
                }}
                className="flex items-center gap-1 font-sans text-xs font-medium text-ink-muted hover:text-ink"
              >
                <X size={12} /> Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-0.5 whitespace-pre-wrap font-sans text-sm text-ink">{content}</p>
        )}

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

          {isOwner && !editing && (
            <button
              onClick={() => {
                setEditing(true);
                setEditValue(content);
              }}
              className="flex items-center gap-1 font-sans text-xs font-medium text-ink-muted transition hover:text-accent"
            >
              <Pencil size={12} /> Edit
            </button>
          )}

          {canDelete && !editing && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className={`flex items-center gap-1 font-sans text-xs font-medium transition disabled:opacity-50 ${
                isOwner ? "text-ink-muted hover:text-red-600" : "text-amber-600 hover:text-red-600"
              }`}
              title={!isOwner ? "Remove as moderator" : undefined}
            >
              {!isOwner && <ShieldAlert size={12} />}
              <Trash2 size={12} /> {deleting ? "Deleting…" : !isOwner ? "Remove" : "Delete"}
            </button>
          )}
        </div>

        {!editing && actionError && (
          <p className="mt-1 font-sans text-xs text-red-600">{actionError}</p>
        )}

        {replying && (
          <div className="mt-2">
            <CommentComposer
              placeholder={`Reply to ${displayName}…`}
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
              <CommentItem
                key={reply._id}
                comment={reply}
                chapterId={chapterId}
                isReply
                currentUserId={currentUserId}
                currentUserRole={currentUserRole}
              />
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