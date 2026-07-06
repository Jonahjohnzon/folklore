"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
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
import { getChapterPresentation } from "@/lib/chapter-presentation";
import { PLATFORM_SOUNDS } from "@/lib/sounds";
import { loadReaderPrefs, saveReaderPrefs, type ReaderPrefs } from "@/lib/reader-prefs";
import { splitIntoBlocks } from "@/lib/reader-blocks";
import { useSnapshot } from "valtio";
import { store } from "@/app/store/userStore";
import { SHEET_THEMES } from "@/lib/sheet-themes";
import { getSheetSurfaceStyle } from "@/lib/sheet-surface";

const FONTS: { id: string; label: string; stack: string }[] = [
  { id: "serif", label: "Source Serif", stack: "var(--font-body)" },
  { id: "display", label: "Fraunces", stack: "var(--font-display)" },
  { id: "sans", label: "Inter", stack: "var(--font-sans)" },
  { id: "mono", label: "Plex Mono", stack: "var(--font-mono)" },
];

const PAGE_TURN_SOUND = PLATFORM_SOUNDS.find((s) => s.id === "page-turn") ?? null;

export function ChapterReader({
  bookSlug, bookTitle, chapter, theme, prevId, nextId,
}: {
  bookSlug: string;
  bookTitle: string;
  chapter: PublicChapterDetail;
  theme: PublicChapterTheme | null;
  prevId?: string;
  nextId?: string;
}) {
  const presentation = useMemo(() => getChapterPresentation(theme), [theme]);

  // NOTE: chapter.audioIntroUrl is a raw URL from the DB (e.g.
  // "/sounds/thunder-crack.mp3"), not a PLATFORM_SOUNDS catalog id. This
  // lookup only works if PLATFORM_SOUNDS ids happen to be full URLs — worth
  // confirming against lib/sounds.ts. If ids are short slugs instead, this
  // should use chapter.audioIntroUrl directly as the <audio> src.
  const entranceSound = PLATFORM_SOUNDS.find((s) => s.id === chapter?.audioIntroUrl) ?? null;

  const [mounted, setMounted] = useState(false);
  const [prefs, setPrefs] = useState<ReaderPrefs | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Derived synchronously from chapter.content — no effect/state round-trip,
  // so there's never a tick where `blocks` is empty on a real render, and
  // the index of each block is stable, so it's safe to use as paragraphIndex.
  const blocks = useMemo(() => splitIntoBlocks(chapter.content), [chapter.content]);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeParagraph, setActiveParagraph] = useState<number | null>(null);

  const [progress, setProgress] = useState(0);

  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [loadingComments, setLoadingComments] = useState(false);

  const containerRef = useRef<HTMLElement>(null);
  const entranceAudioRef = useRef<HTMLAudioElement>(null);
  const pageTurnAudioRef = useRef<HTMLAudioElement>(null);
  const bgMusicAudioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const stored = loadReaderPrefs();
    setPrefs(stored);
    setSettingsOpen(stored === null);
    setMounted(true);
    
  }, [chapter.content, chapter._id]);

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

  async function toggleFullscreen() {
    if (!document.fullscreenElement) await containerRef.current?.requestFullscreen?.();
    else await document.exitFullscreen?.();
  }

  function updatePrefs(partial: Partial<ReaderPrefs>) {
    const merged = {
      mode: prefs?.mode ?? "author",
      fontId: prefs?.fontId ?? presentation.fontId,
      fontSize: prefs?.fontSize ?? presentation.fontSize,
      themeId: prefs?.themeId ?? SHEET_THEMES[0].id,
      soundOn: prefs?.soundOn ?? true,
      pageTurnSoundId: prefs?.pageTurnSoundId ?? PAGE_TURN_SOUND?.id ?? null,
      ...partial,
    };

    const next: ReaderPrefs = {
      ...merged,
      pageTurnSoundId: merged.pageTurnSoundId ?? null,
    };

    saveReaderPrefs(next);
    setPrefs(next);
  }

  const mode = prefs?.mode ?? "author";
  const effectiveFontId = presentation.locks.font || mode === "author" ? presentation.fontId : prefs?.fontId ?? presentation.fontId;
  const soundAllowed = presentation.locks.sound ? true : mode === "author" ? true : prefs?.soundOn ?? true;
  const effectiveFontSize = prefs?.fontSize ?? presentation.fontSize;

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

  const effectiveFont = FONTS.find((f) => f.id === effectiveFontId) ?? FONTS[0];

  useEffect(() => {
    if (!mounted || !entranceAudioRef.current || !entranceSound || !soundAllowed) return;
    const audio = entranceAudioRef.current;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }, [mounted, chapter._id, entranceSound, soundAllowed]);

  function replayEntranceSound() {
    const audio = entranceAudioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }

  const pageTurnSound = PLATFORM_SOUNDS.find((s) => s.id === (prefs?.pageTurnSoundId ?? PAGE_TURN_SOUND?.id)) ?? PAGE_TURN_SOUND;
  function playPageTurn() {
    if (!soundAllowed || !pageTurnSound) return;
    const audio = pageTurnAudioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }

  useEffect(() => {
    const audio = bgMusicAudioRef.current;
    if (!audio || !presentation.bgMusicUrl) return;
    audio.volume = presentation.bgMusicVolume;
    if (soundAllowed) audio.play().catch(() => {});
    else audio.pause();
  }, [soundAllowed, presentation.bgMusicUrl, presentation.bgMusicVolume]);

  function handleCommentPosted(paragraphIndex: number) {
    setCommentCounts((prev) => ({
      ...prev,
      [paragraphIndex]: (prev[paragraphIndex] ?? 0) + 1,
    }));
  }

  const currentUserId = useSnapshot(store)._id;

  return (
    <main ref={containerRef} className="relative bg-bg pb-24 [&:fullscreen]:overflow-y-auto [&:fullscreen]:pb-12">
      {entranceSound && <audio ref={entranceAudioRef} src={entranceSound.url} className="hidden" />}
      {PAGE_TURN_SOUND && <audio ref={pageTurnAudioRef} src={PAGE_TURN_SOUND.url} className="hidden" />}
      {presentation.bgMusicUrl && <audio ref={bgMusicAudioRef} src={presentation.bgMusicUrl} loop className="hidden" />}

      {presentation.customCss && <style>{presentation.customCss}</style>}

      <div className="fixed left-0 top-0 z-40 h-0.5 w-full bg-transparent">
        <div className="h-full bg-accent transition-[width] duration-150 ease-out" style={{ width: `${progress}%` }} />
      </div>

      <div className="sticky top-0 z-30 border-b border-hairline bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-2 px-4 py-2.5 sm:px-6">
          <Link href={`/book/${bookSlug}`} className="min-w-0 truncate font-sans text-sm font-medium text-ink-muted hover:text-accent">
            ← {bookTitle}
          </Link>

          <div className="flex shrink-0 items-center gap-1.5">
            <div className="flex items-center gap-1 rounded-full border border-hairline px-1">
              <button
                onClick={() => updatePrefs({ fontSize: Math.max(14, effectiveFontSize - 2) })}
                className="flex h-7 w-7 items-center justify-center text-ink-muted"
                aria-label="Decrease text size"
              >
                <Minus size={13} />
              </button>
              <span className="font-mono text-xs text-ink-muted">{effectiveFontSize}px</span>
              <button
                onClick={() => updatePrefs({ fontSize: Math.min(26, effectiveFontSize + 2) })}
                className="flex h-7 w-7 items-center justify-center text-ink-muted"
                aria-label="Increase text size"
              >
                <Plus size={13} />
              </button>
            </div>

            {entranceSound && soundAllowed && (
              <button
                onClick={replayEntranceSound}
                aria-label={`Replay ${entranceSound.label}`}
                title={`Replay: ${entranceSound.label}`}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-hairline text-ink-muted hover:border-accent hover:text-accent"
              >
                <Volume2 size={13} />
              </button>
            )}

            <button
              onClick={() => setSettingsOpen(true)}
              aria-label="Reading settings"
              className="flex h-7 w-7 items-center justify-center rounded-full border border-hairline text-ink-muted hover:border-accent hover:text-accent"
            >
              <Settings2 size={13} />
            </button>

            <button
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen reading mode"}
              title={isFullscreen ? "Exit fullscreen (Esc)" : "Fullscreen reading mode"}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-hairline text-ink-muted hover:border-accent hover:text-accent"
            >
              {isFullscreen ? <Minimize size={13} /> : <Maximize size={13} />}
            </button>
          </div>
        </div>
      </div>

      <article className="mx-auto max-w-4xl px-4 pt-14 sm:px-6">
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
          surfaceStyle={getSheetSurfaceStyle(effectiveTheme)}
          onOpenComments={setActiveParagraph}
        />

        {isFullscreen && <p className="mt-6 font-sans text-xs text-ink-muted">Press Esc to exit fullscreen.</p>}

        <div className="mt-10 flex items-center gap-3 border-t border-hairline pt-6">
          <ChapterLikeButton chapterId={String(chapter._id)} />
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          {prevId ? (
            <Link
              href={`/book/${bookSlug}/chapter/${prevId}`}
              onClick={playPageTurn}
              className="flex flex-1 items-center gap-1.5 rounded-xl border border-hairline px-4 py-3.5 font-sans text-sm font-medium text-ink-muted transition hover:border-accent hover:text-accent sm:flex-initial sm:justify-center"
            >
              <ChevronLeft size={16} /> Previous
            </Link>
          ) : <span className="hidden sm:block sm:flex-initial" />}
          {nextId && (
            <Link
              href={`/book/${bookSlug}/chapter/${nextId}`}
              onClick={playPageTurn}
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

      <ParagraphCommentPanel
        open={activeParagraph !== null}
        chapterId={chapter._id}
        paragraphIndex={activeParagraph}
        currentUserId={currentUserId}
        loading={loadingComments}
        onClose={() => setActiveParagraph(null)}
        onCommentPosted={handleCommentPosted}
      />

      {mounted && (
        <ReaderSettingsModal
          open={settingsOpen}
          presentation={presentation}
          authorSoundLabel={entranceSound?.label ?? null}
          currentPrefs={prefs}
          onSave={(next) => { saveReaderPrefs(next); setPrefs(next); setSettingsOpen(false); }}
          onClose={() => setSettingsOpen(false)}
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
      `}</style>
    </main>
  );
}