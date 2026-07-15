// components/edit-book-modal.tsx
"use client";

import { useRef, useState } from "react";
import { X, Loader2, Check, ImagePlus, AlertTriangle } from "lucide-react";
import { type BookManageDTO, type EditableBookStatus } from "@/app/services/DashboardService";
import { BookService } from "@/app/services/BookService";

const GENRES = [
  "Fantasy", "Romance", "Sci-Fi", "Mystery", "Horror", "Drama",
  "Adventure", "Thriller", "Historical", "Slice of Life", "LitRPG", "Poetry",
];

const MAX_COVER_BYTES = 1 * 1024 * 1024; // 1MB
const ALLOWED_COVER_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function EditBookModal({
  book,
  onClose,
  onSaved,
}: {
  book: BookManageDTO;
  onClose: () => void;
  onSaved: (updated: Partial<BookManageDTO>) => void;
}) {
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(book.title);
  const [description, setDescription] = useState(book.description ?? "");
  const [language, setLanguage] = useState(book.language);
  const [status, setStatus] = useState<EditableBookStatus>(
    book.status === "removed" ? "draft" : book.status
  );
  const wasRemoved = book.status === "removed";
  const [matureContent, setMatureContent] = useState(book.matureContent);
  const [tags, setTags] = useState<string[]>(book.tags);
  const [coverUrl, setCoverUrl] = useState(book.coverUrl);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coverWarning, setCoverWarning] = useState<string | null>(null);

  function toggleTag(g: string) {
    setTags((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : prev.length < 5 ? [...prev, g] : prev));
  }

  async function handleCoverSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!ALLOWED_COVER_TYPES.includes(file.type)) {
      setCoverWarning("Use a JPG, PNG, or WEBP image.");
      return;
    }
    if (file.size > MAX_COVER_BYTES) {
      setCoverWarning(`That image is ${(file.size / 1024 / 1024).toFixed(1)}MB — max is 1MB.`);
      return;
    }
    setCoverWarning(null);

    setCoverPreview(URL.createObjectURL(file));
    setUploadingCover(true);
    setError(null);
    try {
      const { data } = await BookService.uploadCover(book._id, file);
      setCoverUrl(data.coverUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't upload cover.");
      setCoverPreview(null);
    } finally {
      setUploadingCover(false);
    }
  }

  async function handleSave() {
    if (!title.trim() || tags.length === 0 || saving) return;
    setSaving(true);
    setError(null);
    try {
      const { data } = await BookService.update(book._id, {
        title: title.trim(),
        description: description.trim() || undefined,
        language,
        status,
        matureContent,
        tags,
      });

      const isEditableStatus = (s: string): s is EditableBookStatus =>
        s === "draft" || s === "ongoing" || s === "completed";

      onSaved({
        title: data.book.title,
        description: data.book.description,
        language: data.book.language,
        status: isEditableStatus(data.book.status) ? data.book.status : book.status,
        matureContent: data.book.matureContent,
        tags: data.book.tags,
        coverUrl,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save changes.");
    } finally {
      setSaving(false);
    }
  }

  const canSave = title.trim().length > 0 && tags.length > 0;
  const displayedCover = coverPreview ?? coverUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-4">
      <div className="flex max-h-[92dvh] w-full flex-col rounded-t-2xl border border-hairline bg-surface shadow-xl sm:max-h-[85vh] sm:max-w-lg sm:rounded-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-hairline px-5 py-4 sm:border-b-0 sm:px-6 sm:pb-0 sm:pt-6">
          <h2 className="font-display text-lg font-semibold text-ink">Edit book info</h2>
          <button onClick={onClose} aria-label="Close" className="text-ink-muted hover:text-ink">
            <X size={18} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 sm:px-6">
          {wasRemoved && (
            <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 font-sans text-sm text-amber-800">
              <AlertTriangle size={15} className="mt-0.5 shrink-0" />
              <span>This book was removed. Saving here will set it back to <strong>Draft</strong> — restore it fully first if that&apos;s not what you want.</span>
            </div>
          )}

          {error && (
            <div className="mt-3 rounded-lg border border-red-300 bg-red-50 px-3 py-2 font-sans text-sm text-red-700">
              {error}
            </div>
          )}

          {coverWarning && (
            <div className="mt-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 font-sans text-sm text-amber-800">
              {coverWarning}
            </div>
          )}

          <div className="mt-4 flex flex-col gap-4 pb-4">
            {/* Cover */}
            <div className="flex items-center gap-4">
              <input
                ref={coverInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleCoverSelect}
              />
              <button
                onClick={() => coverInputRef.current?.click()}
                disabled={uploadingCover}
                className="group relative flex h-28 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-ink-muted/40 bg-bg disabled:opacity-60"
              >
                {displayedCover ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={displayedCover} alt="Cover" className="h-full w-full object-cover" />
                ) : (
                  <ImagePlus size={18} className="text-ink-muted" />
                )}
                {uploadingCover && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <Loader2 size={16} className="animate-spin text-white" />
                  </div>
                )}
                {!uploadingCover && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
                    <span className="font-sans text-[10px] font-medium text-white">Change</span>
                  </div>
                )}
              </button>
              <div>
                <p className="font-sans text-sm font-semibold text-ink">Cover</p>
                <p className="font-sans text-xs text-ink-muted">JPG, PNG, or WEBP. Max 1MB.</p>
              </div>
            </div>

            <div>
              <label className="font-sans text-sm font-semibold text-ink">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-hairline bg-bg px-3.5 py-2.5 font-sans text-sm text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>

            <div>
              <label className="font-sans text-sm font-semibold text-ink">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="mt-1.5 w-full resize-none rounded-lg border border-hairline bg-bg px-3.5 py-2.5 font-sans text-sm text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>

            <div>
              <label className="font-sans text-sm font-semibold text-ink">
                Genre <span className="font-normal text-ink-muted">(up to 5)</span>
              </label>
              <div className="mt-2 flex flex-wrap gap-2">
                {GENRES.map((g) => {
                  const active = tags.includes(g);
                  return (
                    <button
                      key={g}
                      onClick={() => toggleTag(g)}
                      className={`flex items-center gap-1 rounded-full border px-3 py-1.5 font-sans text-xs font-medium transition ${
                        active
                          ? "border-accent bg-accent text-accent-ink"
                          : "border-hairline bg-bg text-ink hover:border-accent hover:text-accent"
                      }`}
                    >
                      {active && <Check size={11} />}
                      {g}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="font-sans text-sm font-semibold text-ink">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as EditableBookStatus)}
                  className="mt-1.5 w-full rounded-lg border border-hairline bg-bg px-3.5 py-2.5 font-sans text-sm text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                >
                  <option value="draft">Draft</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="flex flex-col justify-end">
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-hairline bg-bg px-3.5 py-2.5">
                  <input
                    type="checkbox"
                    checked={matureContent}
                    onChange={(e) => setMatureContent(e.target.checked)}
                    className="h-4 w-4 accent-accent"
                  />
                  <span className="font-sans text-sm text-ink">Mature content</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-hairline px-5 py-4 sm:flex-row sm:justify-end sm:border-t-0 sm:px-6 sm:pb-6 sm:pt-0">
          <button
            onClick={onClose}
            className="rounded-full border border-hairline px-4 py-2.5 font-sans text-sm font-medium text-ink-muted hover:text-ink sm:py-2"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave || saving || uploadingCover}
            className="flex items-center justify-center gap-1.5 rounded-full bg-accent px-4 py-2.5 font-sans text-sm font-semibold text-accent-ink transition disabled:opacity-40 hover:opacity-90 sm:py-2"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}