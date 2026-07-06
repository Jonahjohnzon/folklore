"use client";

import { useState, useRef } from "react";
import { X, Camera, Loader2 } from "lucide-react";
import { store } from "@/app/store/userStore";
import { UserService } from "@/app/services/user.service";
import { uploadImageToCloudinary, cldAvatarUrl } from "@/lib/cloudinary-client"; // was "@/lib/cloudinary"
import { Avatar } from "./avatar";

interface EditProfileModalProps {
  onClose: () => void;
}

export function EditProfileModal({ onClose }: EditProfileModalProps) {
  const [displayName, setDisplayName] = useState(store.displayName  ?? "");
  const [bio, setBio] = useState(store.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(store.avatarUrl);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB");
      return;
    }

    setUploading(true);
    setError(null);
    try {
     const { url } = await uploadImageToCloudinary(file, "avatars");
      setAvatarUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const res = await UserService.updateMe({
        displayName: displayName.trim(),
        bio: bio.trim(),
        avatarUrl,
      });
      store.displayName = res.data.user.displayName || "";
      store.bio = res.data.user.bio || "";
      store.avatarUrl = res.data.user.avatarUrl || null;
      onClose();
    } catch (err) {
      setError(typeof err === "string" ? err : "Couldn't save changes");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-hairline bg-surface-raised p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink">Edit profile</h2>
          <button onClick={onClose} className="cursor-pointer text-ink-muted hover:text-ink">
            <X size={18} />
          </button>
        </div>

        <div className="mt-5 flex flex-col items-center">
          <button onClick={() => fileRef.current?.click()} className="group relative cursor-pointer" aria-label="Change avatar">
            <Avatar avatarUrl={avatarUrl ? cldAvatarUrl(avatarUrl, 96) : null} name={displayName} size={88} />
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-ink/0 transition group-hover:bg-ink/40">
              {uploading ? (
                <Loader2 size={18} className="animate-spin text-white" />
              ) : (
                <Camera size={18} className="text-white opacity-0 transition group-hover:opacity-100" />
              )}
            </div>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
          <p className="mt-2 font-sans text-xs text-ink-muted">Click to change photo</p>
        </div>

        <div className="mt-5">
          <label className="font-sans text-sm font-semibold text-ink">Display name</label>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={40}
            className="mt-2 w-full rounded-lg border border-hairline bg-bg px-3.5 py-2.5 font-sans text-sm text-ink focus:border-accent focus:outline-none"
          />
        </div>

        <div className="mt-4">
          <label className="font-sans text-sm font-semibold text-ink">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={280}
            rows={3}
            className="mt-2 w-full resize-none rounded-lg border border-hairline bg-bg px-3.5 py-2.5 font-sans text-sm text-ink focus:border-accent focus:outline-none"
          />
        </div>

        {error && <p className="mt-3 font-sans text-sm text-red-500">{error}</p>}

        <button
          onClick={handleSave}
          disabled={saving || uploading}
          className="mt-6 w-full cursor-pointer rounded-full bg-accent px-4 py-2.5 font-sans text-sm font-semibold text-accent-ink transition hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </div>
  );
}