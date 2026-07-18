"use client";

import ApiClient from "@/app/ApiCore";
import type { SignedUploadParams } from "@/lib/cloudinary";
import { compressImage } from "./image-compress";
const api = new ApiClient();

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
}

const MAX_UPLOAD_BYTES = 1 * 1024 * 1024; // 1MB
const ALLOWED_UPLOAD_TYPES = ["image/jpeg", "image/png", "image/webp"];

/**
 * Uploads a file directly to Cloudinary from the browser using a
 * short-lived signature minted by our own backend (POST /api/pages/uploads/sign,
 * which holds CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET). The file goes
 * straight to Cloudinary — never through our Next.js server — and no
 * unsigned upload_preset is involved, so a folder can't be uploaded to
 * by anyone who just reads the preset name out of devtools.
 */
// updated uploadImageToCloudinary
export async function uploadImageToCloudinary(
  file: File,
  folder: string
): Promise<CloudinaryUploadResult> {
  if (!ALLOWED_UPLOAD_TYPES.includes(file.type)) {
    throw new Error("Use a JPG, PNG, or WEBP image.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(
      `That image is ${(file.size / 1024 / 1024).toFixed(1)}MB — max is 1MB.`
    );
  }

  const compressed = await compressImage(file);

  const { data } = await api.post<{ success: boolean; data: SignedUploadParams }>(
    "/api/pages/sign",
    { folder }
  );

  const formData = new FormData();
  formData.append("file", compressed);
  formData.append("api_key", data.apiKey);
  formData.append("timestamp", String(data.timestamp));
  formData.append("signature", data.signature);
  formData.append("folder", data.folder);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${data.cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.error?.message ?? "Image upload failed");
  }

  const uploaded = await res.json();
  return { url: uploaded.secure_url as string, publicId: uploaded.public_id as string };
}

/** Face-cropped, auto-format, auto-quality avatar variant at a given size. */
export function cldAvatarUrl(url: string, size = 128) {
  if (!url.includes("res.cloudinary.com")) return url;
  return url.replace("/upload/", `/upload/c_fill,g_face,w_${size},h_${size},q_auto,f_auto/`);
}

/** 2:3 book-cover variant, auto-format, auto-quality. */
export function cldCoverUrl(url: string, width = 600) {
  if (!url.includes("res.cloudinary.com")) return url;
  const height = Math.round((width * 3) / 2);
  return url.replace("/upload/", `/upload/c_fill,g_auto,w_${width},h_${height},q_auto,f_auto/`);
}