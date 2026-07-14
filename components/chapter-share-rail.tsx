// components/chapter-share-rail.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Flag, Check, Link as LinkIcon } from "lucide-react";

function IconButton({
  label, onClick, href, children,
}: {
  label: string;
  onClick?: () => void;
  href?: string;
  children: React.ReactNode;
}) {
  const cls =
    "flex h-9 w-9 items-center justify-center rounded-full border border-hairline text-ink-muted transition hover:border-accent hover:text-accent";
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} title={label} className={cls}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label} className={cls}>
      {children}
    </button>
  );
}

export function ChapterShareRail({
  bookSlug, chapterId, title,
}: {
  bookSlug: string;
  chapterId: string;
  title: string;
}) {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  async function handleInstagramShare() {
    // No official web share intent for arbitrary URLs on Instagram — copy
    // the link so the user can paste it into a story/bio/DM themselves.
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked — silently no-op, button just won't confirm
    }
  }

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return (
    <div className="sticky top-24 hidden w-12 shrink-0 flex-col items-center gap-3 self-start lg:flex">
      <span className="font-sans text-[10px] font-semibold uppercase tracking-wide text-ink-muted">Share</span>

      <IconButton label="Share on X" href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2H21.5l-7.5 8.57L22.75 22h-6.94l-5.43-6.98L4.14 22H1l8.02-9.17L1.5 2h7.12l4.9 6.42L18.244 2Zm-1.22 18h1.83L7.06 3.9H5.1L17.024 20Z" />
        </svg>
      </IconButton>

      <IconButton label="Share on Facebook" href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M13.5 21v-8h2.68l.4-3.1h-3.08V7.9c0-.9.25-1.5 1.53-1.5h1.63V3.63C15.98 3.6 15.1 3.5 14.1 3.5c-2.1 0-3.6 1.28-3.6 3.64v2.76H8v3.1h2.5v8h3Z" />
        </svg>
      </IconButton>

      <IconButton label={copied ? "Link copied" : "Copy link for Instagram"} onClick={handleInstagramShare}>
        {copied ? (
          <Check size={20} />
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
          </svg>
        )}
      </IconButton>

      <IconButton
        label="Share on Tumblr"
        href={`https://www.tumblr.com/widgets/share/tool?canonicalUrl=${encodedUrl}&title=${encodedTitle}`}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14.6 21c-3.1 0-5-1.6-5-4.9v-6.2H7.5V7.1c2.1-.6 3-2.3 3.1-4.1h2.7v3.9h3v3H13.3v5.7c0 1.3.6 1.9 1.7 1.9.5 0 1-.1 1.5-.3l.8 2.9c-.8.5-1.9.9-2.7.9Z" />
        </svg>
      </IconButton>

      <div className="my-1 h-px w-6 bg-hairline" />

      <IconButton label="Copy link" onClick={handleInstagramShare}>
        {copied ? <Check size={20} /> : <LinkIcon size={20} />}
      </IconButton>

      <Link
        href={`/report?bookSlug=${bookSlug}&chapterId=${chapterId}`}
        aria-label="Report this chapter"
        title="Report"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-hairline text-ink-muted transition hover:border-red-400 hover:text-red-500"
      >
        <Flag size={20} />
      </Link>
    </div>
  );
}