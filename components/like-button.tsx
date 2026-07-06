"use client";

import { ThumbsUp } from "lucide-react";

export function LikeButton({
  liked,
  count,
  onToggle,
  disabled,
  size = "md",
}: {
  liked: boolean;
  count: number;
  onToggle: () => void;
  disabled?: boolean;
  size?: "sm" | "md";
}) {
  const padding = size === "sm" ? "px-2.5 py-1.5 text-xs" : "px-3.5 py-2 text-sm";
  const iconSize = size === "sm" ? 12 : 14;

  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={liked}
      className={`flex items-center gap-1.5 rounded-full border font-sans font-medium transition disabled:opacity-50 ${padding} ${
        liked
          ? "border-accent bg-accent/10 text-accent"
          : "border-hairline text-ink-muted hover:border-accent hover:text-accent"
      }`}
    >
      <ThumbsUp size={iconSize} className={liked ? "fill-current" : ""} />
      {count}
    </button>
  );
}