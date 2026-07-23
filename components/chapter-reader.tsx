/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft, ChevronRight, Minus, Plus,
  Maximize, Minimize, Settings2, Volume2,
} from "lucide-react";
import { ParagraphCommentPanel } from "@/components/paragraph-comment-panel";
import { ReaderSettingsModal } from "@/components/reader-settings-modal";
import { ReaderContentSheet } from "@/components/reader-content-sheet";
import { ChapterLikeButton } from "@/components/chapter-like-button";
import { CommentSection } from "@/components/comment-section";
import type { PublicChapterDetail, PublicChapterTheme } from "@/app/services/ChapterService";
import { CommentService, type ParagraphCommentDTO } from "@/app/services/CommentService";
import { SoundService } from "@/app/services/SoundService";
import { getChapterPresentation } from "@/lib/chapter-presentation";
import { PAGE_SOUNDS, type PlatformSound } from "@/lib/sounds";
import { loadReaderPrefs, saveReaderPrefs, type ReaderPrefs } from "@/lib/reader-prefs";
import { splitIntoBlocks } from "@/lib/reader-blocks";
import { useSnapshot } from "valtio";
import { store } from "@/app/store/userStore";
import { SHEET_THEMES } from "@/lib/sheet-themes";
import { getSheetSurfaceStyle } from "@/lib/sheet-surface";
import { RecommendedSidebar } from "./recommended-sidebar";
import { ChapterShareRail } from "./chapter-share-rail";
import { ScrollToTop } from "./scroll-to-top";


const FONTS: { id: string; label: string; stack: string }[] = [
  { id: "serif", label: "Source Serif", stack: "var(--font-body)" },
  { id: "display", label: "Fraunces", stack: "var(--font-display)" },
  { id: "sans", label: "Inter", stack: "var(--font-sans)" },
  { id: "mono", label: "Plex Mono", stack: "var(--font-mono)" },
];

const PAGE_TURN_SOUND = PAGE_SOUNDS.find((s) => s.id === "page-turn") ?? null;

export function ChapterReader({
 bookSlug, bookId, bookTitle, chapter, theme, prevId, nextId,highlightCommentId,highlightParagraphIndex
}: {
  bookSlug: string;
  bookId: string;
  bookTitle: string;
  chapter: PublicChapterDetail;
  theme: PublicChapterTheme | null;
  prevId?: string;
  nextId?: string;
  highlightCommentId?: string | null;
  highlightParagraphIndex?: number | null;

}) {
  const router = useRouter();
  const presentation = useMemo(() => getChapterPresentation(theme), [theme]);
  const [ambientAttention, setAmbientAttention] = useState(false);
  const [hasScrolledToHighlight, setHasScrolledToHighlight] = useState(false);

  const [sounds, setSounds] = useState<PlatformSound[]>([]);

  useEffect(() => {
    let cancelled = false;
    SoundService.list()
      .then(({ data }) => {
        if (!cancelled) setSounds(data.sounds);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const authorAmbientSound = useMemo(
    () => sounds.find((s) => s.id === chapter?.audioId) ?? null,
    [sounds, chapter?.audioId]
  );

  const [mounted, setMounted] = useState(false);
  const [prefs, setPrefs] = useState<ReaderPrefs | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [ambientPlaying, setAmbientPlaying] = useState(false);
  const ambientAudioRef = useRef<HTMLAudioElement>(null);

  const blocks = useMemo(() => splitIntoBlocks(chapter.content), [chapter.content]);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeParagraph, setActiveParagraph] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [loadingComments, setLoadingComments] = useState(false);

  const containerRef = useRef<HTMLElement>(null);
  const pageTurnAudioRef = useRef<HTMLAudioElement>(null);

  const mode = prefs?.mode ?? "author";
  const effectiveFontId = presentation.locks.font || mode === "author" ? presentation.fontId : prefs?.fontId ?? presentation.fontId;
  const effectiveFontSize = prefs?.fontSize ?? presentation.fontSize;

  const ambientAllowed = presentation.locks.sound ? true : mode === "author" ? true : prefs?.soundOn ?? true;
  const pageTurnAllowed = presentation.locks.sound ? true : mode === "author" ? true : Boolean(prefs?.pageTurnSoundId);

  const ambientSound = useMemo(() => {
    const wantsOverride = mode === "custom" && !presentation.locks.sound && prefs?.ambientSoundId;
    if (wantsOverride) {
      return sounds.find((s) => s.id === prefs!.ambientSoundId) ?? authorAmbientSound;
    }
    return authorAmbientSound;
  }, [mode, presentation.locks.sound, prefs?.ambientSoundId, authorAmbientSound, sounds]);

  const toggleAmbientSound = useCallback(() => {
    const audio = ambientAudioRef.current;
    if (!audio || !ambientAllowed) return;
    if (!audio.paused) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
  }, [ambientAllowed]);

  useEffect(() => {
    const audio = ambientAudioRef.current;
    if (!audio) return;

    const handlePlay = () => setAmbientPlaying(true);
    const handlePause = () => setAmbientPlaying(false);
    const handleStalled = () => setAmbientPlaying(false);

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("stalled", handleStalled);
    audio.addEventListener("suspend", handleStalled);

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("stalled", handleStalled);
      audio.removeEventListener("suspend", handleStalled);
    };
  }, [ambientSound?.id]);

  useEffect(() => {
    const stored = loadReaderPrefs();
    setPrefs(stored);
    setSettingsOpen(stored === null);
    setMounted(true);
  }, [chapter.content, chapter._id]);

  useEffect(() => {
    if (!mounted || !ambientSound || !ambientAllowed) return;
    setAmbientAttention(true);
    const timeout = setTimeout(() => setAmbientAttention(false), 3 * 1200 + 200);
    return () => clearTimeout(timeout);
  }, [mounted, ambientSound, ambientAllowed, chapter._id]);

  useEffect(() => {
    let cancelled = false;
    CommentService.getCounts(chapter._id)
      .then(({ data }) => {
        if (!cancelled) setCommentCounts(data.counts);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [chapter._id]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [activeComments, setActiveComments] = useState<ParagraphCommentDTO[]>([]);
  useEffect(() => {
    if (activeParagraph === null) {
      setActiveComments([]);
      return;
    }
    let cancelled = false;
    setLoadingComments(true);
    CommentService.getForParagraph(chapter._id, activeParagraph)
      .then(({ data }) => {
        if (!cancelled) setActiveComments(data.comments);
      })
      .catch(() => {
        if (!cancelled) setActiveComments([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingComments(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeParagraph, chapter._id]);

  useEffect(() => {
    function onChange() { setIsFullscreen(Boolean(document.fullscreenElement)); }
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  useEffect(() => {
    function onScroll() {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - doc.clientHeight;
      const pct = scrollable > 0 ? (doc.scrollTop / scrollable) * 100 : 0;
      setProgress(Math.min(100, Math.max(0, pct)));
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) await containerRef.current?.requestFullscreen?.();
    else await document.exitFullscreen?.();
  }, []);

  const updatePrefs = useCallback((partial: Partial<ReaderPrefs>) => {
    setPrefs((current) => {
      const merged = {
        mode: current?.mode ?? "author",
        fontId: current?.fontId ?? presentation.fontId,
        fontSize: current?.fontSize ?? presentation.fontSize,
        themeId: current?.themeId ?? SHEET_THEMES[0].id,
        soundOn: current?.soundOn ?? true,
        ambientSoundId: current?.ambientSoundId ?? null,
        pageTurnSoundId: current?.pageTurnSoundId ?? null,
        ...partial,
      };

      const next: ReaderPrefs = {
        ...merged,
        pageTurnSoundId: merged.pageTurnSoundId ?? null,
      };

      saveReaderPrefs(next);
      return next;
    });
  }, [presentation.fontId, presentation.fontSize]);

  const handleSettingsSave = useCallback((next: ReaderPrefs) => {
    saveReaderPrefs(next);
    setPrefs(next);
    setSettingsOpen(false);

    const nextAmbientAllowed = presentation.locks.sound
      ? true
      : next.mode === "author"
      ? true
      : next.soundOn;

    if (nextAmbientAllowed && ambientAudioRef.current) {
      ambientAudioRef.current.play().then(
        () => setAmbientPlaying(true),
        () => setAmbientPlaying(false)
      );
    } else {
      ambientAudioRef.current?.pause();
      setAmbientPlaying(false);
    }
  }, [presentation.locks.sound]);

  useEffect(() => {
    if (highlightParagraphIndex == null || hasScrolledToHighlight || !mounted) return;

    const frame = requestAnimationFrame(() => {
      const el = document.getElementById(`paragraph-${highlightParagraphIndex}`);
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setActiveParagraph(highlightParagraphIndex);
      setHasScrolledToHighlight(true);
    });
    return () => cancelAnimationFrame(frame);
  }, [highlightParagraphIndex, mounted, hasScrolledToHighlight, blocks]);

  const effectiveTheme = useMemo(() => {
    const wantsCustomTheme = mode === "custom" && !presentation.locks.theme;
    if (!wantsCustomTheme) {
      return {
        background: presentation.background,
        textColor: presentation.textColor,
        borderColor: presentation.borderColor,
        textureUrl: presentation.textureUrl,
      };
    }
    const chosen = SHEET_THEMES.find((t) => t.id === prefs?.themeId) ?? SHEET_THEMES[0];
    return {
      background: chosen.background,
      textColor: chosen.textColor,
      borderColor: chosen.borderColor,
      textureUrl: null,
    };
  }, [mode, presentation, prefs?.themeId]);

  // getSheetSurfaceStyle(effectiveTheme) would otherwise build a brand-new
  // style object every render even when effectiveTheme itself hasn't
  // changed reference (it's already memoized above, so this just needs its
  // own memo keyed off it) — feeds directly into ReaderContentSheet's props.
  const surfaceStyle = useMemo(() => getSheetSurfaceStyle(effectiveTheme), [effectiveTheme]);

  const effectiveFont = useMemo(
    () => FONTS.find((f) => f.id === effectiveFontId) ?? FONTS[0],
    [effectiveFontId]
  );

  const playPageTurn = useCallback((e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!pageTurnAllowed || !pageTurnAudioRef.current) return;
    e.preventDefault();
    const audio = pageTurnAudioRef.current;
    audio.currentTime = 0;
    audio.play().catch(() => {});
    setTimeout(() => router.push(href), 150);
  }, [pageTurnAllowed, router]);

  useEffect(() => {
    if (!ambientAllowed && ambientPlaying) {
      ambientAudioRef.current?.pause();
      setAmbientPlaying(false);
    }
  }, [ambientAllowed, ambientPlaying]);

  useEffect(() => {
    ambientAudioRef.current?.pause();
    setAmbientPlaying(false);
  }, [chapter._id]);

  const handleCommentPosted = useCallback((paragraphIndex: number) => {
    setCommentCounts((prev) => ({
      ...prev,
      [paragraphIndex]: (prev[paragraphIndex] ?? 0) + 1,
    }));
  }, []);

  const handleCloseCommentPanel = useCallback(() => setActiveParagraph(null), []);
  const handleOpenSettings = useCallback(() => setSettingsOpen(true), []);
  const handleCloseSettings = useCallback(() => setSettingsOpen(false), []);
  const handleDecreaseFontSize = useCallback(
    () => updatePrefs({ fontSize: Math.max(14, effectiveFontSize - 2) }),
    [updatePrefs, effectiveFontSize]
  );
  const handleIncreaseFontSize = useCallback(
    () => updatePrefs({ fontSize: Math.min(26, effectiveFontSize + 2) }),
    [updatePrefs, effectiveFontSize]
  );

  const { _id: currentUserId, role } = useSnapshot(store);
  const isModerator = role === "moderator" || role === "admin";
  return (
    <main ref={containerRef} className="relative bg-bg pb-24 [&:fullscreen]:overflow-y-auto [&:fullscreen]:pb-12">
      {(highlightCommentId || highlightParagraphIndex != null) ? null : <ScrollToTop />}
      {PAGE_TURN_SOUND && <audio ref={pageTurnAudioRef} src={PAGE_TURN_SOUND.url} className="hidden" />}
      {ambientSound && <audio key={ambientSound.id} ref={ambientAudioRef} src={ambientSound.url} loop className="hidden" />}

      {presentation.customCss && <style>{presentation.customCss}</style>}

      <div className="fixed left-0 top-0 z-40 h-0.5 w-full bg-transparent">
        <div className="h-full bg-accent transition-[width] duration-150 ease-out" style={{ width: `${progress}%` }} />
      </div>

        <div className="sticky top-0 z-30 border-b border-hairline bg-surface/95 backdrop-blur">
          <div className="mx-auto flex max-w-4xl items-center justify-between gap-2 px-3 py-2 sm:px-6 sm:py-2.5">
            <Link
              href={`/book/${bookSlug}`}
              className="min-w-0 truncate font-sans text-sm font-medium text-ink-muted hover:text-accent"
            >
              ← {bookTitle}
            </Link>

            <div className="flex shrink-0 items-center gap-1">
              <div className="flex items-center gap-0.5 rounded-full border border-hairline px-0.5">
                <button
                  onClick={handleDecreaseFontSize}
                  className="flex h-9 w-9 items-center justify-center text-ink-muted active:text-accent sm:h-7 sm:w-7"
                  aria-label="Decrease text size"
                >
                  <Minus size={14} />
                </button>
                <span className="hidden font-mono text-xs text-ink-muted xs:inline">
                  {effectiveFontSize}px
                </span>
                <button
                  onClick={handleIncreaseFontSize}
                  className="flex h-9 w-9 items-center justify-center text-ink-muted active:text-accent sm:h-7 sm:w-7"
                  aria-label="Increase text size"
                >
                  <Plus size={14} />
                </button>
              </div>

              {ambientSound && ambientAllowed && (
                <button
                  onClick={toggleAmbientSound}
                  aria-label={ambientPlaying ? `Pause ${ambientSound.label}` : `Play ${ambientSound.label}`}
                  title={ambientPlaying ? `Pause: ${ambientSound.label}` : `Play: ${ambientSound.label}`}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border transition active:scale-95 sm:h-7 sm:w-7 ${
                    ambientPlaying
                      ? "border-accent text-accent"
                      : "border-hairline text-ink-muted hover:border-accent hover:text-accent"
                  } ${ambientAttention ? "ambient-attention" : ""}`}
                >
                  <Volume2 size={14} />
                </button>
              )}

              <button
                onClick={handleOpenSettings}
                aria-label="Reading settings"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-hairline text-ink-muted hover:border-accent hover:text-accent sm:h-7 sm:w-7"
              >
                <Settings2 size={14} />
              </button>

              <button
                onClick={toggleFullscreen}
                aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen reading mode"}
                title={isFullscreen ? "Exit fullscreen (Esc)" : "Fullscreen reading mode"}
                className="hidden h-9 w-9 items-center justify-center rounded-full border border-hairline text-ink-muted hover:border-accent hover:text-accent sm:flex sm:h-7 sm:w-7"
              >
                {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
              </button>
            </div>
          </div>
        </div>
  

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 pt-14 sm:px-6 lg:grid-cols-[1fr_auto_1fr]">
        <div className="hidden lg:flex lg:justify-end">
          <ChapterShareRail bookSlug={bookSlug} chapterId={String(chapter._id)} title={chapter.title} />
        </div>

        <article className="min-w-0 w-full max-w-2xl">
          <div className="relative">
            <span
              aria-hidden
              className="pointer-events-none absolute -left-1 -top-7 select-none font-display text-[6rem] font-bold leading-none opacity-[0.055] sm:text-[8rem]"
              style={{ color: effectiveTheme.textColor }}
            >
              {String(chapter.orderIndex).padStart(2, "0")}
            </span>
            <p className="relative font-sans text-xs font-semibold uppercase tracking-[0.14em] text-accent">
              Chapter {chapter.orderIndex}
            </p>
            <h1 className="relative mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">{chapter.title}</h1>
            {mode === "author" && (
              <p className="relative mt-1.5 font-sans text-xs text-ink-muted">{"Reading in the author's style"}</p>
            )}
          </div>

          <ReaderContentSheet
            blocks={blocks}
            commentCounts={commentCounts}
            stripFontFamily={mode === "custom"}
            fontStack={effectiveFont.stack}
            fontSize={effectiveFontSize}
            lineHeight={presentation.lineHeight}
            ruleColor={effectiveTheme.textColor}
            surfaceStyle={surfaceStyle}
            onOpenComments={setActiveParagraph}
            highlightIndex={hasScrolledToHighlight ? highlightParagraphIndex : null}
          />

          {isFullscreen && <p className="mt-6 font-sans text-xs text-ink-muted">Press Esc to exit fullscreen.</p>}

          <div className="mt-10 flex items-center gap-3 border-t border-hairline pt-6">
            <ChapterLikeButton chapterId={String(chapter._id)} />
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {prevId ? (
              <Link
                href={`/book/${bookSlug}/chapter/${prevId}`}
                onClick={(e) => playPageTurn(e, `/book/${bookSlug}/chapter/${prevId}`)}
                className="flex flex-1 items-center gap-1.5 rounded-xl border border-hairline px-4 py-3.5 font-sans text-sm font-medium text-ink-muted transition hover:border-accent hover:text-accent sm:flex-initial sm:justify-center"
              >
                <ChevronLeft size={16} /> Previous
              </Link>
            ) : <span className="hidden sm:block sm:flex-initial" />}
            {nextId && (
              <Link
                href={`/book/${bookSlug}/chapter/${nextId}`}
                onClick={(e) => playPageTurn(e, `/book/${bookSlug}/chapter/${nextId}`)}
                className="group flex flex-1 items-center justify-between gap-3 rounded-xl bg-accent px-5 py-3.5 font-sans text-accent-ink transition hover:opacity-90"
              >
                <span className="flex flex-col items-start leading-tight">
                  <span className="text-[11px] font-medium uppercase tracking-wide opacity-75">Continue reading</span>
                  <span className="text-sm font-semibold">Next chapter</span>
                </span>
                <ChevronRight size={18} className="shrink-0 transition-transform group-hover:translate-x-1" />
              </Link>
            )}
          </div>

          <CommentSection chapterId={String(chapter._id)} />
        </article>

        <div className="hidden lg:flex lg:justify-start">
          <RecommendedSidebar bookId={bookId} />
        </div>
      </div>
        
      <ParagraphCommentPanel
        open={activeParagraph !== null}
        chapterId={chapter._id}
        paragraphIndex={activeParagraph}
        currentUserId={currentUserId}
        loading={loadingComments}
        onClose={handleCloseCommentPanel}
        onCommentPosted={handleCommentPosted}
        isModerator
      />

      {mounted && (
        <ReaderSettingsModal
          open={settingsOpen}
          presentation={presentation}
          authorSoundLabel={authorAmbientSound?.label ?? null}
          currentPrefs={prefs}
          sounds={sounds}
          onSave={handleSettingsSave}
          onClose={handleCloseSettings}
        />
      )}

      <style>{`
        .cr-first-block .cr-drop-cap {
          float: left;
          font-family: var(--font-display);
          font-size: 4em;
          line-height: 0.82;
          font-weight: 700;
          padding-right: 0.1em;
          padding-top: 0.04em;
          color: inherit;
        }

        .ambient-attention {
          animation: ambient-pulse 1.2s ease-in-out 3;
        }

        @keyframes ambient-pulse {
          0%, 100% {
            border-color: var(--color-hairline, currentColor);
            box-shadow: 0 0 0 0 transparent;
          }
          50% {
            border-color: var(--color-accent, #6366f1);
            box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-accent, #6366f1) 25%, transparent);
          }
        }
      `}</style>
    </main>
  );
}