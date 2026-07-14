// components/back-button.tsx
"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function BackButton({
  label,
  fallbackHref,
  className,
}: {
  label: string;
  fallbackHref: string;
  className?: string;
}) {
  const router = useRouter();

  function handleClick() {
    // If this page was opened directly (e.g. a bookmark, or the "Creator
    // Terms" link that opens in a new tab), there's no in-app history to go
    // back to. history.length === 1 is the practical signal for that case,
    // so fall back to a known destination instead of leaving the user stuck.
    if (typeof window !== "undefined" && window.history.length <= 1) {
      router.push(fallbackHref);
      return;
    }
    router.back();
  }

  return (
    <button
      onClick={handleClick}
      className={
        className ??
        "inline-flex items-center gap-1.5 font-sans text-sm font-medium text-ink-muted transition hover:text-ink"
      }
    >
      <ArrowLeft size={15} /> {label}
    </button>
  );
}