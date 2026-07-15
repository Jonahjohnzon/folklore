"use client";

import { useState } from "react";
import { useRouter } from "nextjs-toploader/app";
import { MoreHorizontal, Flag } from "lucide-react";
import { FollowButton } from "./follow-button";
import { PublicUser } from "@/app/services/user.service";

interface ProfileActionsProps {
  username: string;
  initialFollowing: boolean;
  initialBlocked: boolean;
  profile: PublicUser | null;
  onFollowChange?: (isFollowing: boolean) => void;
}

export function ProfileActions({
  username,
  initialFollowing,
  initialBlocked,
  profile,
  onFollowChange,
}: ProfileActionsProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <FollowButton
        targetType="author"
        targetId={profile?._id}
        initialFollowing={initialFollowing}
        onChange={onFollowChange}
      />

      <div className="relative">
        <button
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="More options"
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-hairline text-ink-muted transition hover:border-accent hover:text-accent"
        >
          <MoreHorizontal size={15} />
        </button>

        {menuOpen && (
          <div className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-xl border border-hairline bg-surface-raised p-1.5 shadow-xl">
            <button
              onClick={() => {
                router.push("/report");
                setMenuOpen(false);
              }}
              className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2.5 font-sans text-sm font-medium text-ink transition hover:bg-bg"
            >
              <Flag size={15} />
              Report
            </button>
          </div>
        )}
      </div>
    </div>
  );
}