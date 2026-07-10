"use client";
import { getSheetSurfaceStyle, SheetOpeningRule } from "@/lib/sheet-surface";
import { useRef, useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Save, UploadCloud, FileUp, Loader2, CheckCircle2 } from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import {TextStyle} from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import FontFamily from "@tiptap/extension-font-family";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import {Table} from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";

import type { ChapterAccess } from "@/lib/types";
import { SHEET_THEMES, DEFAULT_SHEET_THEME_ID } from "@/lib/sheet-themes";
import EditorToolbar from "@/components/editor/EditorToolbar";
import SoundPickerModal from "@/components/editor/SoundPickerModal";
import ChapterSidebar from "@/components/editor/ChapterSidebar";
import { FontSize } from "@/components/editor/FontSize";
import type {CreatorLocks} from "@/lib/chapter-presentation";
import { BookService, type Book } from "@/app/services/BookService";
import { ChapterService } from "@/app/services/ChapterService";
import {  soundIdForUrl } from "@/lib/sound-effects";

// How long the "Chapter saved!" / "Chapter published!" toast stays on screen.
const TOAST_DURATION_MS = 3500;

type ToastKind = "saved" | "published";

export default function ChapterEditorPage({ params }: { params: { bookId: string } }) {
  const searchParams = useSearchParams();
  const existingChapterId = searchParams.get("chapterId");

  const [book, setBook] = useState<Book | null>(null);
  const [chapterId, setChapterId] = useState<string | null>(existingChapterId);
  const [loadingChapter, setLoadingChapter] = useState(Boolean(existingChapterId));

  const [title, setTitle] = useState("");
  const [access, setAccess] = useState<ChapterAccess>("free");
  const [coins, setCoins] = useState(20);
  const [wordCount, setWordCount] = useState(0);
  const [locks, setLocks] = useState<CreatorLocks>({ theme: false, font: false, sound: false });
  const [selectedSoundId, setSelectedSoundId] = useState<string | null>(null);
  const [soundPickerOpen, setSoundPickerOpen] = useState(false);

  const [sheetThemeId, setSheetThemeId] = useState(DEFAULT_SHEET_THEME_ID);

  // Chapter cover — optional, shown in the sidebar. Like the genre tags on the
  // book-creation step, there's no chapter-cover persistence endpoint wired up
  // yet, so this stays local (preview only) until ChapterService supports it.
  const [chapterCoverFile, setChapterCoverFile] = useState<File | null>(null);
  const [chapterCoverPreview, setChapterCoverPreview] = useState<string | null>(null);

  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Obvious success feedback — a toast that pops up after a save/publish
  // completes, plus its own timer so a later action can cancel/replace it.
  const [toast, setToast] = useState<ToastKind | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sheetRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sheetTheme = SHEET_THEMES.find((t) => t.id === sheetThemeId) ?? SHEET_THEMES[0];

  const updateWordCount = useCallback((text: string) => {
    setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
  }, []);

  const showToast = useCallback((kind: ToastKind) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(kind);
    toastTimerRef.current = setTimeout(() => setToast(null), TOAST_DURATION_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const editor = useEditor({
    // SSR: Tiptap renders client-side only, this avoids a Next.js hydration warning
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TextStyle,
      Color,
      FontFamily,
      FontSize,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: "Once upon a time…" }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: "<p></p>",
    editorProps: {
      attributes: {
        class: "tiptap-sheet focus:outline-none",
        style: "overflow-wrap: anywhere; word-break: break-word;",
      },
      // Strip inline styles/classes from pasted HTML (e.g. from Word/Google Docs)
      // so foreign fonts and colors don't fight the sheet's own formatting.
      transformPastedHTML(html) {
        return html
          .replace(/ style="[^"]*"/gi, "")
          .replace(/ class="[^"]*"/gi, "")
          .replace(/<font[^>]*>/gi, "")
          .replace(/<\/font>/gi, "");
      },
    },
    onUpdate: ({ editor }) => updateWordCount(editor.getText()),
  });

  // Load the book so the header shows its real title instead of a placeholder.
  useEffect(() => {
    BookService.get(params.bookId)
      .then(({ data }) => setBook(data.book))
      .catch(() => {
        /* header falls back to the bookId-less placeholder below */
      });
  }, [params.bookId]);
  useEffect(() => {
  BookService.getTheme(params.bookId)
    .then(({ data }) => {
      setSheetThemeId(data.theme.sheetThemeId ?? DEFAULT_SHEET_THEME_ID);
      setLocks(data.theme.locks ?? { theme: false, font: false, sound: false });
    })
    .catch(() => {
      // no theme doc yet for a brand-new book — keep the defaults already in state
    });
}, [params.bookId]);

  // If we were sent here to edit an existing chapter (?chapterId=...), load it in.
  // Loading an existing chapter now also picks up its persisted cover.
  useEffect(() => {
    if (!existingChapterId || !editor) return;
    let cancelled = false;
    setLoadingChapter(true);
    ChapterService.get(params.bookId, existingChapterId)
      .then(({ data }) => {
        if (cancelled) return;
        const chapter = data.chapter;
        setTitle(chapter.title);
        setAccess(chapter.accessType);
        setCoins(chapter.coinsRequired || 20);
        setSelectedSoundId(soundIdForUrl(chapter.audioId));
        setChapterCoverPreview(chapter.coverUrl ?? null);
        editor.commands.setContent(chapter.content || "<p></p>");
        updateWordCount(editor.getText());
      })
      .catch((err) => {
        if (!cancelled) {
          setSaveError(err instanceof Error ? err.message : "Couldn't load that chapter.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingChapter(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingChapterId, editor]);

  function handleChapterCoverSelect(file: File) {
    setChapterCoverFile(file);
    setChapterCoverPreview((prev) => {
      if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  }


  async function handleSheetThemeChange(id: string) {
  setSheetThemeId(id); // optimistic — sheet re-renders immediately
  const theme = SHEET_THEMES.find((t) => t.id === id) ?? SHEET_THEMES[0];
  try {
    await BookService.updateTheme(params.bookId, {
      sheetThemeId: theme.id,
      textureUrl: theme.textureUrl ?? null,
      bgColor: theme.background,
      textColor: theme.textColor,
      linkColor: theme.borderColor,
    });
  } catch (err) {
    setSaveError(err instanceof Error ? err.message : "Couldn't save the sheet theme.");
  }
    }

async function handleLocksChange(next: CreatorLocks) {
  setLocks(next); // optimistic
  try {
    await BookService.updateTheme(params.bookId, { locks: next });
  } catch (err) {
    setSaveError(err instanceof Error ? err.message : "Couldn't save the lock settings.");
  }
}
  // If a cover was already uploaded (persisted URL, not a local blob), removing
  // it patches the backend immediately. A pending local file just clears state.
  async function handleChapterCoverRemove() {
    const hadPendingFile = Boolean(chapterCoverFile);
    setChapterCoverFile(null);
    setChapterCoverPreview((prev) => {
      if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
      return null;
    });
    if (!hadPendingFile && chapterId) {
      try {
        await ChapterService.update(params.bookId, chapterId, { coverUrl: null });
      } catch (err) {
        setSaveError(err instanceof Error ? err.message : "Couldn't remove the cover.");
      }
    }
  }



  function validateChapter(): string | null {
    if (!title.trim()) return "Add a chapter title before saving.";
    if (!editor || !editor.getText().trim()) return "Add some content before saving.";
    return null;
  }

  // --- Persistence: create the chapter on first save, update it after ---
  async function persistChapter() {
    try{
    if (!editor) return null;
    const content = editor.getHTML();
    const payload = {
      title: title.trim(),
      content,
      accessType: access,
      coinsRequired: access === "coins" ? coins : undefined,
      audioId: selectedSoundId,
    };

    if (!chapterId) {
      const { data } = await ChapterService.create(params.bookId, payload);
      setChapterId(data.chapter._id);
      return data.chapter._id;
    }

    await ChapterService.update(params.bookId, chapterId, payload);
    return chapterId;
  }
  catch(err){
    console.log(err)
  }
  }

  async function handleSaveDraft() {
    if (!editor || saving || publishing) return;
    const validationError = validateChapter();
    if (validationError) {
      setSaveError(validationError);
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const id = await persistChapter();
      // if (id) await uploadPendingCoverIfAny(id);
      setLastSavedAt(new Date());
      showToast("saved");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Couldn't save the draft.");
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    if (!editor || saving || publishing) return;
    const validationError = validateChapter();
    if (validationError) {
      setSaveError(validationError);
      return;
    }
    setPublishing(true);
    setSaveError(null);
    try {
      const id = await persistChapter();
      if (id) {
        // await uploadPendingCoverIfAny(id);
        await ChapterService.publish(params.bookId, id);
      }
      setLastSavedAt(new Date());
      showToast("published");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Couldn't publish the chapter.");
    } finally {
      setPublishing(false);
    }
  }


   // --- File import: PDF or .txt, extracted and dropped into the editor as the chapter body ---
  async function handleFileImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    setImportError(null);
    setImporting(true);
    try {
      let text = "";
      if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
        text = await extractPdfText(file);
      } else if (file.type === "text/plain" || file.name.toLowerCase().endsWith(".txt")) {
        text = await file.text();
      } else {
        throw new Error("Only PDF and .txt files are supported right now.");
      }

      if (!title.trim()) {
        const inferredTitle = file.name.replace(/\.(pdf|txt)$/i, "");
        setTitle(inferredTitle);
      }

      const paragraphs = text
        .split(/\n{2,}|\r\n\r\n/)
        .map((p) => p.trim())
        .filter(Boolean);
      const html = paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join("");

      editor.commands.setContent(html || "<p></p>");
      updateWordCount(editor.getText());
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Couldn't read that file.");
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function extractPdfText(file: File): Promise<string> {
    const pdfjs = await import("pdfjs-dist");
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

    const buffer = await file.arrayBuffer();
    const doc = await pdfjs.getDocument({ data: buffer }).promise;
    const pageTexts: string[] = [];
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pageText = content.items.map((it: any) => ("str" in it ? it.str : "")).join(" ");
      pageTexts.push(pageText);
    }
    return pageTexts.join("\n\n");
  }

  function escapeHtml(s: string) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  
    function insertTable() {
    editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: false }).run();
  }

  function savedLabel() {
    if (saving) return "Saving…";
    if (!lastSavedAt) return "Not saved yet";
    const secs = Math.max(0, Math.round((Date.now() - lastSavedAt.getTime()) / 1000));
    if (secs < 5) return "Saved just now";
    if (secs < 60) return `Saved ${secs}s ago`;
    return `Saved ${Math.round(secs / 60)} min ago`;
  }

  // Tear down the editor on unmount (Tiptap recommends this to avoid leaks
  // across route changes in Next.js's client-side navigation)
  useEffect(() => {
    return () => editor?.destroy();
  }, [editor]);

  // Release the cover object URL when it changes or the page unmounts.
  useEffect(() => {
    return () => {
      if (chapterCoverPreview) URL.revokeObjectURL(chapterCoverPreview);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="mx-auto max-w-375 px-4 py-6 sm:px-6">
      {/* Obvious success toast — top-of-viewport, fixed, auto-dismisses */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed left-1/2 top-6 z-50 -translate-x-1/2 animate-in fade-in slide-in-from-top-2"
        >
          <div className="flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 font-sans text-sm font-semibold text-white shadow-lg shadow-emerald-600/30">
            <CheckCircle2 size={18} />
            {toast === "published" ? "Chapter published!" : "Chapter saved!"}
          </div>
        </div>
      )}

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-sans text-xs font-medium uppercase tracking-wide text-accent">
            {book?.title ?? "Loading…"}
          </p>
          <h1 className="mt-0.5 font-display text-2xl font-bold text-ink">
            {chapterId ? "Edit chapter" : "New chapter"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-sans text-xs text-ink-muted">{savedLabel()}</span>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,text/plain,application/pdf"
            className="hidden"
            onChange={handleFileImport}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="flex items-center gap-1.5 rounded-full border border-hairline bg-bg px-4 py-2 font-sans text-sm font-medium text-ink shadow-sm transition hover:border-accent disabled:opacity-50"
          >
            {importing ? <Loader2 size={14} className="animate-spin" /> : <FileUp size={14} />}
            {importing ? "Importing…" : "Import file"}
          </button>
          <button
            onClick={handleSaveDraft}
            disabled={saving || publishing}
            className="flex items-center gap-1.5 rounded-full border border-hairline bg-bg px-4 py-2 font-sans text-sm font-medium text-ink shadow-sm transition hover:border-accent disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Save draft
          </button>
          <button
            onClick={handlePublish}
            disabled={saving || publishing}
            className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 font-sans text-sm font-semibold text-accent-ink shadow-sm transition hover:opacity-90 hover:shadow-md disabled:opacity-50"
          >
            {publishing ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
            Publish
          </button>
        </div>
      </div>

      {importError && (
        <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-3.5 py-2 font-sans text-sm text-red-700">
          {importError}
        </div>
      )}
      {saveError && (
        <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-3.5 py-2 font-sans text-sm text-red-700">
          {saveError}
        </div>
      )}
      {loadingChapter && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-hairline bg-bg px-3.5 py-2 font-sans text-sm text-ink-muted">
          <Loader2 size={14} className="animate-spin" /> Loading chapter…
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Editor */}
        <div className="overflow-hidden rounded-xl border border-hairline bg-surface shadow-sm">
          <EditorToolbar
            editor={editor}
            onInsertTable={insertTable}
            wordCount={wordCount}
          />

           <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Chapter title"
            className="w-full bg-transparent px-5 pt-5 font-display text-2xl font-semibold text-ink placeholder:text-ink-muted/50 focus:outline-none"
           />
          <p className="px-5 pt-1 font-sans text-[11px] text-ink-muted">Title and content are required to save.</p>

          {/* Page canvas — a neutral tray the "sheet" sits in, like a doc editor */}
          <div className="overflow-x-auto bg-ink/[0.035] px-4 py-10 sm:px-10">
            <div
              ref={sheetRef}
              className="prose-reader relative mx-auto min-h-275 w-full max-w-210 rounded-sm border p-12 text-base shadow-lg sm:p-16"
              style={getSheetSurfaceStyle(sheetTheme)}
            >
              <SheetOpeningRule color={sheetTheme.textColor} />
              <EditorContent editor={editor} className="relative z-0 min-h-250" />
            </div>
          </div>
        </div>

        <ChapterSidebar
          access={access}
          onAccessChange={setAccess}
          coins={coins}
          onCoinsChange={setCoins}
          selectedSoundId={selectedSoundId}
          onClearSound={() => setSelectedSoundId(null)}
          onOpenSoundPicker={() => setSoundPickerOpen(true)}
          coverPreview={chapterCoverPreview}
          onCoverSelect={handleChapterCoverSelect}
          onRemoveCover={handleChapterCoverRemove}
          sheetThemeId={sheetThemeId}
          onSheetThemeChange={handleSheetThemeChange}
          locks={locks}
          onLocksChange={handleLocksChange}
        />
      </div>

      <SoundPickerModal
        open={soundPickerOpen}
        selectedSoundId={selectedSoundId}
        onSelect={setSelectedSoundId}
        onClose={() => setSoundPickerOpen(false)}
      />
    </main>
  );
}