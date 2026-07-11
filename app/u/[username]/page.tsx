"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { useSnapshot } from "valtio";
import { Pencil, LayoutDashboard, Calendar, BadgeCheck, Link as LinkIcon, Home } from "lucide-react";
import { store } from "@/app/store/userStore";
import { UserService, type PublicUser } from "@/app/services/user.service";
import { BookService, type BookDTO } from "@/app/services/BookService";
import { Avatar } from "@/components/avatar";
import { EditProfileFullscreen } from "@/components/edit-profile-fullscreen";
import { ProfileActions } from "@/components/profile-actions";
import { ProfileWorksGrid } from "@/components/profile-works-grid";
import { BadgeShelf } from "@/components/badge-shelf";
import ProfileSkeleton from "./loading";

export default function ProfilePage() {
  const params = useParams<{ username: string }>();
  const router = useRouter();
  const snap = useSnapshot(store);

  const [profile, setProfile] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [editing, setEditing] = useState(false);

  const [works, setWorks] = useState<BookDTO[]>([]);
  const [worksLoading, setWorksLoading] = useState(false);

  const isOwnProfile = snap.authChecked && snap.username === params.username;

  

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    UserService.getPublicProfile(params.username)
      .then((res) => !cancelled && setProfile(res.data.user))
      .catch(() => !cancelled && setNotFound(true))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [params.username]);

  useEffect(() => {
    if (!profile || profile.creatorStatus !== "active") {
      setWorks([]);
      return;
    }
    let cancelled = false;
    setWorksLoading(true);
    BookService.getWorksForUser(params.username)
      .then((res) => !cancelled && setWorks(res.data.books))
      .catch(() => !cancelled && setWorks([]))
      .finally(() => !cancelled && setWorksLoading(false));
    return () => {
      cancelled = true;
    };
  }, [profile, params.username]);

  

  if (loading) {
   return <ProfileSkeleton />;
  }

  if (notFound || !profile) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <button
          onClick={() => router.push("/")}
          className="mx-auto flex items-center gap-1.5 cursor-pointer rounded-full border border-hairline bg-bg px-3 py-1.5 font-sans text-xs font-medium text-ink-muted shadow-sm transition hover:border-accent hover:text-accent"
        >
          <Home size={14} />
          Home
        </button>
        <h1 className="mt-6 font-display text-2xl font-semibold text-ink">Profile not found</h1>
        <p className="mt-2 font-sans text-sm text-ink-muted">{"This reader doesn't exist, or the link is broken."}</p>
      </div>
    );
  }

  const isCreator = profile.creatorStatus === "active";
  const displayName = profile.displayName || profile.username;


  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 ">
      <button
        onClick={() => router.replace("/")}
        className="flex items-center gap-1.5 cursor-pointer rounded-full border border-hairline bg-bg px-3 py-3 font-sans text-xs font-medium text-ink-muted shadow-sm transition hover:border-accent hover:text-accent"
      >
        <Home size={20} />
        
      </button>

      <div className="mt-6 flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left">
        <Avatar avatarUrl={profile.avatarUrl || null} name={displayName} size={112} />

        <div className="mt-4 flex-1 sm:ml-6 sm:mt-0">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center justify-center gap-1.5 sm:justify-start">
                <h1 className="font-display text-2xl font-semibold text-ink">{displayName}</h1>
                {isCreator && (
                  <BadgeCheck size={18} className="shrink-0 text-accent" aria-label="Verified creator" />
                )}
              </div>
              <p className="font-sans text-sm text-ink-muted">@{profile.username}</p>
            </div>

            {isOwnProfile ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditing(true)}
                  className="flex cursor-pointer items-center gap-1.5 rounded-full border border-hairline px-4 py-2 font-sans text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
                >
                  <Pencil size={14} />
                  Edit profile
                </button>
                {isCreator && (
                  <button
                    onClick={() => router.push("/dashboard")}
                    className="flex cursor-pointer items-center gap-1.5 rounded-full bg-accent px-4 py-2 font-sans text-sm font-semibold text-accent-ink transition hover:opacity-70"
                  >
                    <LayoutDashboard size={14} />
                    Dashboard
                  </button>
                )}
              </div>
            ) : (
              <ProfileActions
                username={profile.username}
                profile={profile}
                initialFollowing={profile.isFollowing ?? false}
                initialBlocked={profile.isBlocked ?? false}
              />
            )}
          </div>

          {profile.bio && <p className="mt-3 font-sans text-sm text-ink-muted">{profile.bio}</p>}
            {profile.badges.length > 0 && (
            <div className="mt-4">
              <BadgeShelf badges={profile.badges} role="chip" />
            </div>
          )}
          <div className="mt-3 flex flex-wrap  border-b pb-4 border-hairline items-center justify-center gap-x-4 gap-y-1.5 font-sans text-xs text-ink-muted sm:justify-start">
            <span className="flex items-center gap-1.5">
              <Calendar size={13} />
              Joined {new Date(profile.createdAt).toLocaleDateString(undefined, { month: "long", year: "numeric" })}
            </span>
            {profile.websiteUrl && (
              <a
                href={profile.websiteUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="flex items-center gap-1.5 hover:text-accent"
              >
                <LinkIcon size={13} />
                {profile.websiteUrl.replace(/^https?:\/\//, "")}
              </a>
            )}
          </div>

          {isCreator && (
            <div className="mt-4 flex justify-center gap-6 sm:justify-start">
              <div>
                <p className="font-display text-base font-semibold text-ink">{works.length}</p>
                <p className="font-sans text-xs text-ink-muted">Works</p>
              </div>
              <div>
                <p className="font-display text-base font-semibold text-ink">{profile.followerCount ?? 0}</p>
                <p className="font-sans text-xs text-ink-muted">Followers</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {isCreator && !worksLoading && <ProfileWorksGrid works={works} />}
      {isCreator && worksLoading && (
        <div className="mt-8 grid grid-cols-3 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-2/3 animate-pulse rounded-lg bg-hairline" />
          ))}
        </div>
      )}

      {editing && <EditProfileFullscreen onClose={() => setEditing(false)} />}
    </div>
  );
}