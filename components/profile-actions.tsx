"use client";

import { useState } from "react";
import { useRouter } from "nextjs-toploader/app";
import {  MoreHorizontal, Flag } from "lucide-react";
import { UserService } from "@/app/services/user.service";
import { FollowButton } from "./follow-button";
import { PublicUser } from "@/app/services/user.service";
interface ProfileActionsProps {
  username: string;
  initialFollowing: boolean;
  initialBlocked: boolean;
  profile:PublicUser | null
}

export function ProfileActions({ username, initialFollowing, initialBlocked , profile}: ProfileActionsProps) {
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [blocked, setBlocked] = useState(initialBlocked);
  const [menuOpen, setMenuOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  async function toggleFollow() {
    setBusy(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      following ? await UserService.unfollow(username) : await UserService.follow(username);
      setFollowing((f) => !f);
    } finally {
      setBusy(false);
    }
  }

  async function toggleBlock() {
    setBusy(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      blocked ? await UserService.unblock(username) : await UserService.block(username);
      setBlocked((b) => !b);
      setMenuOpen(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
              <FollowButton
          targetType="author"
          targetId={profile?._id} // profile._id — need PublicUser's actual id field name
          initialFollowing={initialFollowing}
        />

      {/* <button
        onClick={toggleFollow}
        disabled={busy || blocked}
        aria-label={following ? "Turn off notifications" : "Get notified of new posts"}
        className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border transition disabled:cursor-not-allowed disabled:opacity-40 ${
          following ? "border-accent text-accent" : "border-hairline text-ink-muted hover:border-accent hover:text-accent"
        }`}
      >
        {following ? <Bell size={15} /> : <BellOff size={15} />}
      </button> */}

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
            {/* <button
              onClick={toggleBlock}
              disabled={busy}
              className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2.5 font-sans text-sm font-medium text-red-500 transition hover:bg-bg"
            >
              <ShieldOff size={15} />
              {blocked ? "Unblock" : "Block"} @{username}
            </button> */}
            <button
              onClick={() => {
                router.push('/report')
                setMenuOpen(false)}}
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