"use client";

import { useEffect, useState } from "react";
import { X, Heart, CornerDownRight, Loader2, ChevronDown, Pencil, Trash2 } from "lucide-react";
import { CommentService, type ParagraphCommentDTO } from "@/app/services/CommentService";
import { Avatar } from "@/components/avatar";

const PAGE_SIZE = 10;

function timeAgo(dateStr: string) {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days <= 0) return "today";
  if (days === 1) return "1d ago";
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function CommentRow({
  comment,
  currentUserId,
  onLove,
  onReply,
  onEdit,
  onDelete,
  isReply = false,
}: {
  comment: ParagraphCommentDTO;
  currentUserId?: string | null;
  onLove: (id: string) => void;
  onReply: (parentId: string, body: string) => Promise<void>;
  onEdit: (id: string, body: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isReply?: boolean;
}) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyDraft, setReplyDraft] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  const [editing, setEditing] = useState(false);
  const [editDraft, setEditDraft] = useState(comment.body);
  const [savingEdit, setSavingEdit] = useState(false);

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const isOwn = !!currentUserId && comment.userId === currentUserId;
  const wasEdited = comment.updatedAt && comment.updatedAt !== comment.createdAt;

  async function submitReply() {
    if (!replyDraft.trim() || submittingReply) return;
    setSubmittingReply(true);
    try {
      await onReply(comment.id, replyDraft.trim());
      setReplyDraft("");
      setReplyOpen(false);
    } finally {
      setSubmittingReply(false);
    }
  }

  async function saveEdit() {
    if (!editDraft.trim() || savingEdit) return;
    setSavingEdit(true);
    try {
      await onEdit(comment.id, editDraft.trim());
      setEditing(false);
    } finally {
      setSavingEdit(false);
    }
  }

  async function confirmDelete() {
    if (deleting) return;
    setDeleting(true);
    try {
      await onDelete(comment.id);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className={isReply ? "ml-8 mt-2.5" : ""}>
      <div className="rounded-xl border border-hairline bg-bg p-3">
        <div className="flex items-center gap-2">
          <Avatar avatarUrl={comment.avatarUrl} name={comment.username} size={28} />
         <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="truncate font-sans text-sm font-semibold text-ink">{comment.username}</p>
              {comment.isAuthor && (
                <span className="shrink-0 rounded-full bg-accent/15 px-1.5 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-wide text-accent">
                  Author
                </span>
              )}
            </div>
            <p className="font-sans text-[11px] text-ink-muted">
              {timeAgo(comment.createdAt)}
              {wasEdited && " · edited"}
            </p>
          </div>

          {isOwn && !editing && !confirmingDelete && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setEditDraft(comment.body);
                  setEditing(true);
                }}
                aria-label="Edit comment"
                className="text-ink-muted hover:text-accent"
              >
                <Pencil size={13} />
              </button>
              <button
                onClick={() => setConfirmingDelete(true)}
                aria-label="Delete comment"
                className="text-ink-muted hover:text-danger"
              >
                <Trash2 size={13} />
              </button>
            </div>
          )}
        </div>

        {editing ? (
          <div className="mt-2">
            <textarea
              autoFocus
              value={editDraft}
              onChange={(e) => setEditDraft(e.target.value)}
              rows={2}
              disabled={savingEdit}
              className="w-full resize-none rounded-lg border border-hairline bg-bg px-2.5 py-1.5 font-sans text-sm text-ink focus:border-accent focus:outline-none disabled:opacity-60"
            />
            <div className="mt-1.5 flex items-center gap-2">
              <button
                disabled={!editDraft.trim() || savingEdit}
                onClick={saveEdit}
                className="flex items-center gap-1 rounded-full bg-accent px-3 py-1 font-sans text-xs font-semibold text-accent-ink hover:opacity-90 disabled:opacity-40"
              >
                {savingEdit && <Loader2 size={11} className="animate-spin" />}
                Save
              </button>
              <button
                disabled={savingEdit}
                onClick={() => setEditing(false)}
                className="font-sans text-xs font-medium text-ink-muted hover:text-ink"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="prose-reader mt-2 text-sm text-ink">{comment.body}</p>
        )}

        {confirmingDelete && (
          <div className="mt-2 flex items-center gap-2 rounded-lg bg-danger/10 px-2.5 py-1.5">
            <span className="font-sans text-xs text-ink">
              {isReply ? "Delete this reply?" : "Delete this comment and its replies?"}
            </span>
            <button
              disabled={deleting}
              onClick={confirmDelete}
              className="ml-auto flex items-center gap-1 font-sans text-xs font-semibold text-danger hover:opacity-80 disabled:opacity-50"
            >
              {deleting && <Loader2 size={11} className="animate-spin" />}
              Delete
            </button>
            <button
              disabled={deleting}
              onClick={() => setConfirmingDelete(false)}
              className="font-sans text-xs font-medium text-ink-muted hover:text-ink"
            >
              Cancel
            </button>
          </div>
        )}

        {!editing && !confirmingDelete && (
          <div className="mt-2 flex items-center gap-3">
            {!isOwn && (
              <button
                onClick={() => onLove(comment.id)}
                className={`flex items-center gap-1 font-sans text-xs font-medium transition ${
                  comment.lovedByMe ? "text-accent" : "text-ink-muted hover:text-accent"
                }`}
              >
                <Heart size={12} className={comment.lovedByMe ? "fill-current" : ""} />
                {comment.lovedByMe ? "Loved" : "Love"}
              </button>
            )}

            {!isReply && (
              <button
                onClick={() => setReplyOpen((o) => !o)}
                className="flex items-center gap-1 font-sans text-xs font-medium text-ink-muted hover:text-accent"
              >
                <CornerDownRight size={12} /> Reply
              </button>
            )}

            {comment.helpfulVotes > 0 && (
              <span className="ml-auto flex items-center gap-1 font-sans text-[11px] text-ink-muted">
                <Heart size={11} className="fill-current text-accent" />
                {comment.helpfulVotes}
              </span>
            )}
          </div>
        )}
      </div>

      {replyOpen && (
        <div className="ml-8 mt-2 flex items-center gap-1.5">
          <input
            autoFocus
            value={replyDraft}
            onChange={(e) => setReplyDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitReply()}
            placeholder={`Reply to ${comment.username}…`}
            disabled={submittingReply}
            className="flex-1 rounded-full border border-hairline bg-bg px-3 py-1.5 font-sans text-xs text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none disabled:opacity-60"
          />
          <button
            disabled={!replyDraft.trim() || submittingReply}
            onClick={submitReply}
            className="flex items-center gap-1 rounded-full bg-accent px-3 py-1.5 font-sans text-xs font-semibold text-accent-ink transition hover:opacity-90 disabled:opacity-40"
          >
            {submittingReply && <Loader2 size={11} className="animate-spin" />}
            Post
          </button>
        </div>
      )}
    </div>
  );
}

function ThreadedComment({
  comment,
  chapterId,
  currentUserId,
  onLove,
  onReply,
  onEdit,
  onDeleteTopLevel,
}: {
  comment: ParagraphCommentDTO;
  chapterId: string | null;
  currentUserId?: string| null;
  onLove: (id: string) => void;
  onReply: (parentId: string, body: string) => Promise<void>;
  onEdit: (id: string, body: string, isReply: boolean, parentId?: string) => Promise<void>;
  onDeleteTopLevel: (id: string) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [replies, setReplies] = useState<ParagraphCommentDTO[] | null>(null);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [replyCount, setReplyCount] = useState(comment.replyCount ?? 0);

  async function toggleReplies() {
    if (expanded) {
      setExpanded(false);
      return;
    }
    setExpanded(true);
    if (replies === null) {
      setLoadingReplies(true);
      try {
        const { data } = await CommentService.getReplies(chapterId, comment.id);
        setReplies(data.replies);
      } finally {
        setLoadingReplies(false);
      }
    }
  }

  async function handleReplyHere(parentId: string, body: string) {
    await onReply(parentId, body);
    setReplyCount((n) => n + 1);
    const { data } = await CommentService.getReplies(chapterId, comment.id);
    setReplies(data.replies);
    setExpanded(true);
  }

  async function handleEditReply(id: string, body: string) {
    await onEdit(id, body, true, comment.id);
    setReplies((prev) => (prev ? prev.map((r) => (r.id === id ? { ...r, body } : r)) : prev));
  }

  // Replies are excluded from the server-side ChapterCommentCount counter
  // (see the POST route's `if (!parentId)` guard), so deleting one must
  // NOT touch commentCounts/paragraph badge state — only the locally
  // rendered reply list and this thread's own reply count.
  async function handleDeleteReply(id: string) {
    await CommentService.remove(chapterId, id);
    setReplies((prev) => (prev ? prev.filter((r) => r.id !== id) : prev));
    setReplyCount((n) => Math.max(0, n - 1));
  }

  return (
    <div>
      <CommentRow
        comment={comment}
        currentUserId={currentUserId}
        onLove={onLove}
        onReply={handleReplyHere}
        onEdit={(id, body) => onEdit(id, body, false)}
        onDelete={onDeleteTopLevel}
      />

      {replyCount > 0 && (
        <button
          onClick={toggleReplies}
          className="ml-8 mt-1.5 flex items-center gap-1 font-sans text-xs font-medium text-ink-muted hover:text-accent"
        >
          <ChevronDown size={12} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
          {expanded ? "Hide" : "View"} {replyCount} {replyCount === 1 ? "reply" : "replies"}
        </button>
      )}

      {expanded && (
        <div>
          {loadingReplies && (
            <div className="ml-8 mt-2 flex items-center gap-2 text-ink-muted">
              <Loader2 size={12} className="animate-spin" />
              <span className="font-sans text-xs">Loading replies…</span>
            </div>
          )}
          {!loadingReplies &&
            replies?.map((r) => (
              <CommentRow
                key={r.id}
                comment={r}
                currentUserId={currentUserId}
                onLove={onLove}
                onReply={handleReplyHere}
                onEdit={handleEditReply}
                onDelete={handleDeleteReply}
                isReply
              />
            ))}
        </div>
      )}
    </div>
  );
}

export function ParagraphCommentPanel({
  open,
  chapterId,
  paragraphIndex,
  currentUserId,
  loading = false,
  onClose,
  onCommentPosted,
}: {
  open: boolean;
  chapterId: string | null;
  paragraphIndex: number | null;
  currentUserId?: string | null;
  loading?: boolean;
  onClose: () => void;
  onCommentPosted?: (paragraphIndex: number) => void;
}) {
  const [comments, setComments] = useState<ParagraphCommentDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || paragraphIndex === null) return;
    let cancelled = false;
    setFetching(true);
    setError(null);
    CommentService.getForParagraph(chapterId, paragraphIndex, 0, PAGE_SIZE)
      .then(({ data }) => {
        if (cancelled) return;
        setComments(data.comments);
        setTotal(data.total);
        setHasMore(data.hasMore);
      })
      .finally(() => !cancelled && setFetching(false));
    return () => {
      cancelled = true;
    };
  }, [open, chapterId, paragraphIndex]);

  if (!open || paragraphIndex === null) return null;

  async function loadMore() {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const { data } = await CommentService.getForParagraph(chapterId, paragraphIndex!, comments.length, PAGE_SIZE);
      setComments((prev) => [...prev, ...data.comments]);
      setHasMore(data.hasMore);
    } finally {
      setLoadingMore(false);
    }
  }

  async function handleLove(id: string) {
    const target = comments.find((c) => c.id === id);
    const wasLoved = target?.lovedByMe ?? false;

    setComments((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, lovedByMe: !wasLoved, helpfulVotes: c.helpfulVotes + (wasLoved ? -1 : 1) }
          : c
      )
    );
    try {
      const { data } = await CommentService.love(chapterId, id);
      // Reconcile with server truth in case of race.
      setComments((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, lovedByMe: data.comment.lovedByMe, helpfulVotes: data.comment.helpfulVotes } : c
        )
      );
    } catch {
      setComments((prev) =>
        prev.map((c) =>
          c.id === id
            ? { ...c, lovedByMe: wasLoved, helpfulVotes: c.helpfulVotes + (wasLoved ? 1 : -1) }
            : c
        )
      );
    }
  }

  async function handleReply(parentId: string, body: string) {
    await CommentService.create(chapterId, { paragraphIndex: paragraphIndex!, body, parentId });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function handleEdit(id: string, body: string, isReply: boolean, parentId?: string) {
    await CommentService.update(chapterId, id, body);
    if (!isReply) {
      setComments((prev) =>
        prev.map((c) => (c.id === id ? { ...c, body, updatedAt: new Date().toISOString() } : c))
      );
    }
    // Reply-level state (the replies array) is owned by ThreadedComment and
    // updated there directly — see handleEditReply.
  }

  async function handleDeleteTopLevel(id: string) {
    await CommentService.remove(chapterId, id);
    setComments((prev) => prev.filter((c) => c.id !== id));
    setTotal((t) => Math.max(0, t - 1));
  }

  async function postTopLevelComment() {
    if (!draft.trim() || posting) return;
    setPosting(true);
    setError(null);
    try {
      const { data } = await CommentService.create(chapterId, {
        paragraphIndex: paragraphIndex!,
        body: draft.trim(),
      });
      setComments((prev) => [...prev, data.comment]);
      setTotal((t) => t + 1);
      setDraft("");
      onCommentPosted?.(paragraphIndex!);
    } catch {
      setError("Couldn't post your comment — try again.");
    } finally {
      setPosting(false);
    }
  }

  const showLoading = loading || fetching;

  return (
    <div className="fixed inset-0 z-50">
      <button className="absolute inset-0 bg-black/40" onClick={onClose} aria-label="Close comments" />
      <div className="absolute right-0 top-0 flex h-full w-full max-w-sm flex-col bg-surface p-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-hairline pb-3">
          <span className="font-display text-base font-semibold text-ink">Paragraph comments ({total})</span>
          <button onClick={onClose} aria-label="Close">
            <X size={18} className="text-ink-muted" />
          </button>
        </div>

        <div className="mt-3 flex-1 space-y-3 overflow-y-auto">
          {showLoading && (
            <div className="mt-6 flex items-center justify-center gap-2 text-ink-muted">
              <Loader2 size={14} className="animate-spin" />
              <span className="font-sans text-sm">Loading comments…</span>
            </div>
          )}

          {!showLoading && comments.length === 0 && (
            <p className="mt-6 text-center font-sans text-sm text-ink-muted">
              No comments yet on this paragraph — be the first.
            </p>
          )}

          {!showLoading &&
            comments.map((c) => (
              <ThreadedComment
                key={c.id}
                comment={c}
                chapterId={chapterId}
                currentUserId={currentUserId}
                onLove={handleLove}
                onReply={handleReply}
                onEdit={handleEdit}
                onDeleteTopLevel={handleDeleteTopLevel}
              />
            ))}

          {!showLoading && hasMore && (
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="flex w-full items-center justify-center gap-1.5 py-2 font-sans text-xs font-semibold text-accent hover:opacity-80 disabled:opacity-50"
            >
              {loadingMore && <Loader2 size={12} className="animate-spin" />}
              Load 10 more
            </button>
          )}
        </div>

        <div className="mt-3 border-t border-hairline pt-3">
          {error && <p className="mb-2 font-sans text-xs text-danger">{error}</p>}
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Add a comment on this paragraph…"
            rows={2}
            disabled={posting}
            className="w-full resize-none rounded-lg border border-hairline bg-bg px-3 py-2 font-sans text-sm text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none disabled:opacity-60"
          />
          <button
            disabled={!draft.trim() || posting}
            onClick={postTopLevelComment}
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-full bg-accent px-4 py-2 font-sans text-sm font-semibold text-accent-ink transition hover:opacity-90 disabled:opacity-40"
          >
            {posting && <Loader2 size={14} className="animate-spin" />}
            Post comment
          </button>
        </div>
      </div>
    </div>
  );
}