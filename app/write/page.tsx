/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useRef, useState } from "react";
import { useRouter } from "nextjs-toploader/app";
import { useSnapshot } from "valtio";
import { ImagePlus, ChevronRight, Check, ArrowLeft, Loader2 } from "lucide-react";
import type { BookStatus } from "@/lib/types";
import { BookService } from "@/app/services/BookService";
import { store } from "@/app/store/userStore";

const GENRES = [
  "Fantasy", "Romance", "Sci-Fi", "Mystery", "Horror", "Drama",
  "Adventure", "Thriller", "Historical", "Slice of Life", "LitRPG", "Poetry",
];

// Presets map onto BookTheme's actual hex fields (bgColor/textColor/accentColor/linkColor).


const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "pt", label: "Portuguese" },
  { code: "id", label: "Indonesian" },
  { code: "ja", label: "Japanese" },
];

async function withRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (i < attempts - 1) await new Promise((r) => setTimeout(r, 500 * (i + 1)));
    }
  }
  throw lastErr;
}

export default function NewBookPage() {
  const router = useRouter();
  const snap = useSnapshot(store);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const MAX_COVER_BYTES = 1 * 1024 * 1024;
  const ALLOWED_COVER_TYPES = ["image/jpeg", "image/png", "image/webp"];
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [matureContent, setMatureContent] = useState(false);
  const [status, setStatus] = useState<BookStatus>("draft");
  const [language, setLanguage] = useState("en");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitStage, setSubmitStage] = useState<"cover" | "book" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [coverWarning, setCoverWarning] = useState<string | null>(null);

  function toggleGenre(g: string) {
    setSelectedGenres((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : prev.length < 5 ? [...prev, g] : prev
    );
  }

  function handleCoverSelect(e: React.ChangeEvent<HTMLInputElement>) {
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
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
    
  }

  async function handleContinue() {
    if (!canContinue || submitting) return;
    setSubmitting(true);
    setError(null);
    setCoverWarning(null);

    // Cover goes first: if it fails, we want to know before a book exists,
    // and it never blocks creation — worst case we proceed without it.
    let coverUrl: string | undefined;
    let coverPublicId: string | undefined;

    if (coverFile) {
      setSubmitStage("cover");
      try {
        const { data } = await withRetry(() => BookService.uploadCoverStandalone(coverFile));
        coverUrl = data.coverUrl;
        coverPublicId = data.coverPublicId;
      } catch {
        setCoverWarning("Cover didn't upload — you can add it from the editor.");
      }
    }

    setSubmitStage("book");
    try {
      const { data } = await BookService.create({
        title: title.trim(),
        description: description.trim() || undefined,
        language,
        status,
        matureContent,
        tags: selectedGenres,
        coverUrl,
        coverPublicId,
      });
      router.replace(`/write/${data.book._id}/editor`);
    } catch (err: any) {
      setError(err.message || "Couldn't create the book.");
      setSubmitting(false);
      setSubmitStage(null);
    }
  }

  const canContinue = title.trim().length > 0 && selectedGenres.length > 0;

   if (!snap.authChecked) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <Loader2 size={20} className="animate-spin text-ink-muted" />
      </main>
    );
  }

  if (!snap._id) {
    router.replace("/sign-in");
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <Loader2 size={20} className="animate-spin text-ink-muted" />
      </main>
    );
  }

  if (snap.creatorStatus !== "active") {
    router.replace("/creator/apply");
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <Loader2 size={20} className="animate-spin text-ink-muted" />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <button
        onClick={() => router.replace('/')}
        className="flex items-center gap-1.5 cursor-pointer rounded-full border border-hairline bg-bg px-3 py-1.5 font-sans text-xs font-medium text-ink-muted shadow-sm transition hover:border-accent hover:text-accent"
      >
        <ArrowLeft size={14} />
        Home
      </button>

      <div className="mt-5 flex items-center gap-2">
        <span className="font-sans text-xs font-semibold uppercase tracking-wide text-accent">
          Step 1 of 2
        </span>
        <span className="h-1 w-1 rounded-full bg-ink-muted/40" />
        <span className="font-sans text-xs text-ink-muted">Book setup</span>
      </div>
      <h1 className="mt-2 font-display text-3xl font-bold text-ink">Set up your book</h1>
      <p className="mt-2 font-sans text-sm text-ink-muted">
        Cover, genre, and look — you can change all of this later.
      </p>

      {error && (
        <div className="mt-4 rounded-lg border border-red-300 bg-red-50 px-3.5 py-2 font-sans text-sm text-red-700">
          {error}
        </div>
      )}

      {coverWarning && (
        <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 px-3.5 py-2 font-sans text-sm text-amber-800">
          {coverWarning}
        </div>
      )}

      <div className="mt-8 grid gap-8 rounded-2xl border border-hairline bg-surface/60 p-6 shadow-sm lg:grid-cols-[220px_1fr] lg:p-8">
        {/* Cover uploader */}
        <div>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleCoverSelect}
          />
          <button
            onClick={() => coverInputRef.current?.click()}
            className="group relative flex aspect-2/3 w-full items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-ink-muted/40 bg-bg shadow-inner transition hover:border-accent hover:bg-accent/5"
          >
            {coverPreview ? (
              <img src={coverPreview} alt="Cover preview" className="h-full w-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-2 px-4 text-center">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/10">
                  <ImagePlus size={18} className="text-accent" />
                </div>
                <span className="font-sans text-xs font-medium text-ink-muted">
                  Upload cover - [1MB]
                  <br />
                  <span className="text-ink-muted/70">recommended 600×900</span>
                </span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />
            {coverPreview && (
              <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-2.5 py-1 font-sans text-[11px] font-medium text-white opacity-0 transition group-hover:opacity-100">
                Change cover
              </span>
            )}
          </button>
        </div>

        {/* Form fields */}
        <div className="flex flex-col gap-6">
          <div>
            <label className="font-sans text-sm font-semibold text-ink">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="The Last Ember Court"
              className="mt-1.5 w-full rounded-lg border border-hairline bg-bg px-3.5 py-2.5 font-display text-lg text-ink shadow-sm placeholder:text-ink-muted/50 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>

          <div>
            <label className="font-sans text-sm font-semibold text-ink">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this book about? Hook readers in a couple of sentences."
              rows={4}
              className="mt-1.5 w-full resize-none rounded-lg border border-hairline bg-bg px-3.5 py-2.5 font-sans text-sm text-ink shadow-sm placeholder:text-ink-muted/50 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>

          <div>
            <label className="font-sans text-sm font-semibold text-ink">
              Genre <span className="font-normal text-ink-muted">(up to 5)</span>
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {GENRES.map((g) => {
                const active = selectedGenres.includes(g);
                return (
                  <button
                    key={g}
                    onClick={() => toggleGenre(g)}
                    className={`flex items-center gap-1 rounded-full border px-3.5 py-1.5 font-sans text-sm font-medium transition ${
                      active
                        ? "border-accent bg-accent text-accent-ink shadow-sm"
                        : "border-hairline bg-bg text-ink hover:border-accent hover:text-accent"
                    }`}
                  >
                    {active && <Check size={13} />}
                    {g}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="font-sans text-sm font-semibold text-ink">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as BookStatus)}
                className="mt-1.5 w-full rounded-lg border border-hairline bg-bg px-3.5 py-2.5 font-sans text-sm text-ink shadow-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              >
                <option value="draft">Draft (not visible yet)</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="flex flex-col justify-end">
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-hairline bg-bg px-3.5 py-2.5 shadow-sm transition hover:border-accent">
                <input
                  type="checkbox"
                  checked={matureContent}
                  onChange={(e) => setMatureContent(e.target.checked)}
                  className="h-4 w-4 accent-accent"
                />
                <span className="font-sans text-sm text-ink">Contains mature content</span>
              </label>
            </div>
          </div>

          <div>
            <label className="font-sans text-sm font-semibold text-ink">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-hairline bg-bg px-3.5 py-2.5 font-sans text-sm text-ink shadow-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          {/* <div>
            <label className="font-sans text-sm font-semibold text-ink">Reading theme</label>
            <p className="mt-1 font-sans text-xs text-ink-muted">
              Sets the default colors readers see — they can still switch it themselves.
            </p>
            <div className="mt-2 flex flex-wrap gap-2.5">
              {THEME_PRESETS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setThemeId(t.id)}
                  className={`flex items-center gap-2 rounded-full border px-3 py-1.5 font-sans text-sm font-medium transition ${
                    themeId === t.id
                      ? "border-accent bg-accent/10 text-ink shadow-sm"
                      : "border-hairline bg-bg text-ink hover:border-accent"
                  }`}
                >
                  <span
                    className="h-3.5 w-3.5 rounded-full border border-ink/15"
                    style={{ backgroundColor: t.swatch }}
                  />
                  {t.label}
                  {themeId === t.id && <Check size={13} className="text-accent" />}
                </button>
              ))}
            </div>
          </div> */}
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <p className="font-sans text-xs text-ink-muted">
          {canContinue ? "Looking good." : "Add a title and at least one genre to continue."}
        </p>
        <button
          disabled={!canContinue || submitting}
          onClick={handleContinue}
          className="flex items-center gap-1.5 rounded-full bg-accent px-5 py-2.5 font-sans text-sm font-semibold text-accent-ink shadow-sm transition disabled:cursor-not-allowed disabled:opacity-40 hover:opacity-90 hover:shadow-md"
        >
          {submitting ? <Loader2 size={15} className="animate-spin" /> : <ChevronRight size={15} />}
          {submitting
            ? submitStage === "cover"
              ? "Uploading cover…"
              : "Creating…"
            : "Continue to editor"}
        </button>
      </div>
    </main>
  );
}