"use client";

import { useEffect, useRef, useState } from "react";
import { Camera } from "lucide-react";
import { useSnapshot } from "valtio";
import { store } from "@/app/store/userStore";
import { UserService } from "@/app/services/user.service";
import { Avatar } from "@/components/avatar";
import { FieldLabel, TextInput, TextArea, SaveBar, type SaveStatus } from "./shared";
import { hydrateStore } from "@/app/store/StoreHydrator";

const BIO_MAX = 200;

export function ProfileTab({ onDirtyChange }: { onDirtyChange: (dirty: boolean) => void }) {
  const snap = useSnapshot(store);

  const [displayName, setDisplayName] = useState(snap.displayName ?? "");
  const [username] = useState(snap.username ?? "");
  const [bio, setBio] = useState(snap.bio ?? "");
  const [websiteUrl, setWebsiteUrl] = useState(snap.websiteUrl ?? "");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(snap.avatarUrl || null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [status, setStatus] = useState<SaveStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const dirty =
    displayName !== (snap.displayName ?? "") ||
    username !== (snap.username ?? "") ||
    bio !== (snap.bio ?? "") ||
    websiteUrl !== (snap.websiteUrl ?? "") ||
    avatarFile !== null;

  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);

  const handleAvatarPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > 1 * 1024 * 1024) {
      setError("Image must be under 1MB.");
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setError(null);
  };

  const handleSave = async () => {
    setStatus("saving");
    setError(null);
    
    try {
      if (avatarFile) {
        await UserService.uploadAvatar(username, avatarFile);
       }
       await UserService.updateMe({
        displayName,
        bio,
        websiteUrl,
      });

      await hydrateStore()
      setAvatarFile(null);
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setStatus("error");
      setError(err?.response?.data?.message ?? "Couldn't save your profile. Try again.");
    }
  };

  return (
    <div className="">
      <h3 className="font-display text-xl font-semibold text-ink">Profile</h3>
      <p className="mt-1 font-sans text-sm text-ink-muted">This is how other readers see you across Lore.</p>

      {/* Avatar */}
      <div className="mt-6 flex items-center gap-4">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="group relative cursor-pointer rounded-full"
          aria-label="Change avatar"
        >
          <Avatar avatarUrl={avatarPreview} name={displayName || username} size={84} />
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 text-transparent transition group-hover:bg-black/40 group-hover:text-white">
            <Camera size={20} />
          </span>
        </button>
        <div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer rounded-full border border-hairline px-4 py-2 font-sans text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
          >
            Change photo
          </button>
          <p className="mt-1.5 font-sans text-xs text-ink-muted">JPG or PNG, up to 1MB.</p>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarPick} className="hidden" />
      </div>

      {/* Display name */}
      <div className="mt-6">
        <FieldLabel>Display name</FieldLabel>
        <TextInput value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={40} placeholder="Your name" />
      </div>

  


      {/* Bio */}
      <div className="mt-5">
        <FieldLabel>Bio</FieldLabel>
        <TextArea value={bio} onChange={(e) => setBio(e.target.value.slice(0, BIO_MAX))} rows={4} placeholder="Tell readers about yourself" />
        <p className="mt-1 text-right font-sans text-xs text-ink-muted">
          {bio.length}/{BIO_MAX}
        </p>
      </div>

      {/* Website */}
      <div className="mt-1">
        <FieldLabel>Website</FieldLabel>
        <TextInput value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://" />
      </div>

      <SaveBar status={status} errorMessage={error} onSave={handleSave} disabled={!dirty} />
    </div>
  );
}