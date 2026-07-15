"use client";

import { useState } from "react";
import { UserPlus, UserCheck, Loader2 } from "lucide-react";
import { FollowService, type FollowTargetType } from "@/app/services/FollowService";

interface FollowButtonProps {
  targetType: FollowTargetType;
  targetId: string | undefined;
  initialFollowing: boolean;
  onChange?: (following: boolean) => void;
  size?: "sm" | "md";
}

export function FollowButton({ targetType, targetId, initialFollowing, onChange, size = "md" }: FollowButtonProps) {
  const [following, setFollowing] = useState(initialFollowing);
  const [pending, setPending] = useState(false);

  async function handleClick() {
    if (pending || !targetId) return;

    // optimistic update — flip immediately, roll back on failure
    const next = !following;
    setFollowing(next);
    setPending(true);

    try {
      if (next) {
        await FollowService.follow(targetType, targetId);
      } else {
        await FollowService.unfollow(targetType, targetId);
      }
      onChange?.(next);
    } catch {
      setFollowing(!next); // roll back
    } finally {
      setPending(false);
    }
  }

  const padding = size === "sm" ? "px-3 py-1.5" : "px-4 py-2";
  const textSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className={`flex cursor-pointer items-center gap-1.5 rounded-full font-sans font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${padding} ${textSize} ${
        following
          ? "border border-hairline text-ink hover:border-red-300 hover:text-red-500"
          : "bg-accent text-accent-ink hover:opacity-70"
      }`}
    >
      {pending ? (
        <Loader2 size={14} className="animate-spin" />
      ) : following ? (
        <UserCheck size={14} />
      ) : (
        <UserPlus size={14} />
      )}
      {following ? "Following" : "Follow"}
    </button>
  );
}