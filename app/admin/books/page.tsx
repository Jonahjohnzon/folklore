/* eslint-disable @next/next/no-img-element */
// app/admin/books/page.tsx
"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Search, Trash2, TriangleAlert, Loader2, X } from "lucide-react";
import { AdminService, type AdminBookRow } from "@/app/services/AdminService";

type ModalState =
  | { type: "delete"; book: AdminBookRow }
  | { type: "warn"; book: AdminBookRow }
  | null;

const STATUS_STYLES: Record<AdminBookRow["status"], string> = {
  draft: "border-hairline bg-surface text-ink-muted",
  ongoing: "border-emerald-300 bg-emerald-50 text-emerald-700",
  completed: "border-sky-300 bg-sky-50 text-sky-700",
  hiatus: "border-amber-300 bg-amber-50 text-amber-700",
  removed: "border-red-300 bg-red-50 text-red-700",
};

export default function AdminBooksPage() {
  const [books, setBooks] = useState<AdminBookRow[]>([]);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalState>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback((pageToLoad: number, query: string) => {
    setLoading(true);
    AdminService.getBooks(pageToLoad, query || undefined)
      .then((res) => {
        setBooks(res.data.books);
        setHasMore(res.data.hasMore);
        setPage(pageToLoad);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load(1, "");
  }, [load]);

  // debounced live search — fires 350ms after the user stops typing
  function handleSearchChange(value: string) {
    setQ(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => load(1, value), 350);
  }

  function handleDeleted(bookId: string) {
    setBooks((prev) => prev.filter((b) => b._id !== bookId));
    setModal(null);
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Books</h1>

      <div className="relative mt-4 max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
        <input
          value={q}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search by title…"
          className="w-full rounded-lg border border-hairline py-2 pl-8 pr-3 font-sans text-sm"
        />
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-hairline">
        <table className="w-full text-left font-sans text-sm">
          <thead className="border-b border-hairline text-xs uppercase text-ink-muted">
            <tr>
              <th className="px-4 py-2.5">Book</th>
              <th className="px-4 py-2.5">Author</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5">Chapters</th>
              <th className="px-4 py-2.5">Reads</th>
              <th className="px-4 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.map((b) => (
              <tr key={b._id} className="border-b border-hairline last:border-0">
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2.5">
                    {b.coverUrl ? (
                      <img src={b.coverUrl} alt="" className="h-10 w-7 rounded object-cover" />
                    ) : (
                      <div className="h-10 w-7 rounded bg-surface" />
                    )}
                    <div>
                      <p className="font-medium text-ink">{b.title}</p>
                      <p className="text-xs text-ink-muted">/{b.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-2.5 text-ink-muted">
                  {b.author ? `@${b.author.username}` : "—"}
                </td>
                <td className="px-4 py-2.5">
                  <span className={`rounded-full border px-2 py-0.5 font-sans text-[11px] font-semibold ${STATUS_STYLES[b.status]}`}>
                    {b.status}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-ink-muted">{b.totalChapters}</td>
                <td className="px-4 py-2.5 text-ink-muted">{b.totalReads.toLocaleString()}</td>
                <td className="px-4 py-2.5">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setModal({ type: "warn", book: b })}
                      className="flex items-center gap-1 rounded border border-hairline px-2 py-1 text-xs text-ink transition hover:border-amber-400 hover:text-amber-700"
                    >
                      <TriangleAlert size={12} /> Warn
                    </button>
                    <button
                      onClick={() => setModal({ type: "delete", book: b })}
                      className="flex items-center gap-1 rounded border border-hairline px-2 py-1 text-xs text-ink transition hover:border-red-400 hover:text-red-700"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!loading && books.length === 0 && (
          <p className="py-10 text-center font-sans text-sm text-ink-muted">No books found.</p>
        )}
      </div>

      {loading && (
        <div className="mt-4 flex items-center gap-2 font-sans text-sm text-ink-muted">
          <Loader2 size={14} className="animate-spin" /> Loading…
        </div>
      )}

      <div className="mt-4 flex gap-2">
        {page > 1 && (
          <button onClick={() => load(page - 1, q)} className="font-sans text-sm text-accent hover:underline">
            Previous
          </button>
        )}
        {hasMore && (
          <button onClick={() => load(page + 1, q)} className="font-sans text-sm text-accent hover:underline">
            Next
          </button>
        )}
      </div>

      {modal?.type === "delete" && (
        <DeleteModal book={modal.book} onClose={() => setModal(null)} onDeleted={handleDeleted} />
      )}
      {modal?.type === "warn" && (
        <WarnModal book={modal.book} onClose={() => setModal(null)} />
      )}
    </div>
  );
}

function DeleteModal({
  book,
  onClose,
  onDeleted,
}: {
  book: AdminBookRow;
  onClose: () => void;
  onDeleted: (bookId: string) => void;
}) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setSubmitting(true);
    setError(null);
    try {
      await AdminService.deleteBook(book._id, reason.trim() || undefined);
      onDeleted(book._id);
    } catch {
      setError("Failed to delete. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ModalShell onClose={onClose} accent="red">
      <h2 className="font-display text-lg font-semibold text-ink">Delete “{book.title}”?</h2>
      <p className="mt-1.5 font-sans text-sm text-ink-muted">
        This permanently removes the book, its chapters, comments, likes, and reading history. This
        can&apos;t be undone. The author will get a notification (no email) with the reason below, if you add one.
      </p>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Reason (optional) — shown to the author"
        rows={3}
        className="mt-3 w-full rounded-lg border border-hairline px-3 py-2 font-sans text-sm"
      />
      {error && <p className="mt-2 font-sans text-xs text-red-600">{error}</p>}
      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={onClose}
          className="rounded-lg border border-hairline px-3 py-1.5 font-sans text-sm text-ink"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          disabled={submitting}
          className="rounded-lg bg-red-600 px-3 py-1.5 font-sans text-sm font-medium text-white disabled:opacity-50"
        >
          {submitting ? "Deleting…" : "Delete permanently"}
        </button>
      </div>
    </ModalShell>
  );
}

function WarnModal({ book, onClose }: { book: AdminBookRow; onClose: () => void }) {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSend() {
    if (!message.trim()) {
      setError("Message can't be empty.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await AdminService.warnBookAuthor(book._id, message.trim());
      setSent(true);
      setTimeout(onClose, 900);
    } catch {
      setError("Failed to send. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ModalShell onClose={onClose} accent="amber">
      <h2 className="font-display text-lg font-semibold text-ink">Warn author of “{book.title}”</h2>
      <p className="mt-1.5 font-sans text-sm text-ink-muted">
        Sends an in-app notification only — no email, and the book stays live.
      </p>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="e.g. This book violates our mature content policy. Please add a content tag or edit chapter 3."
        rows={4}
        className="mt-3 w-full rounded-lg border border-hairline px-3 py-2 font-sans text-sm"
      />
      {error && <p className="mt-2 font-sans text-xs text-red-600">{error}</p>}
      {sent && <p className="mt-2 font-sans text-xs text-emerald-600">Warning sent.</p>}
      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={onClose}
          className="rounded-lg border border-hairline px-3 py-1.5 font-sans text-sm text-ink"
        >
          Cancel
        </button>
        <button
          onClick={handleSend}
          disabled={submitting || sent}
          className="rounded-lg bg-amber-500 px-3 py-1.5 font-sans text-sm font-medium text-white disabled:opacity-50"
        >
          {submitting ? "Sending…" : "Send warning"}
        </button>
      </div>
    </ModalShell>
  );
}

function ModalShell({
  children,
  onClose,
  accent,
}: {
  children: React.ReactNode;
  onClose: () => void;
  accent: "red" | "amber";
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl border border-hairline bg-bg p-5 shadow-xl">
        <div className="flex justify-end">
          <button onClick={onClose} className="text-ink-muted hover:text-ink">
            <X size={16} />
          </button>
        </div>
        <div className={accent === "red" ? "-mt-2" : "-mt-2"}>{children}</div>
      </div>
    </div>
  );
}