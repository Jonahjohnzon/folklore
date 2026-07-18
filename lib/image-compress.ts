// lib/image-compress.ts

interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0–1
}

export async function compressImage(
  file: File,
  { maxWidth = 600, maxHeight = 1000, quality = 0.6 }: CompressOptions = {}
): Promise<File> {
  // Skip compression for already-small files or non-standard types (e.g. gif — canvas would kill animation)
  if (file.size < 200_000 || file.type === "image/gif") return file;

  const bitmap = await createImageBitmap(file);

  let { width, height } = bitmap;
  if (width > maxWidth || height > maxHeight) {
    const ratio = Math.min(maxWidth / width, maxHeight / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file; // fall back to original if canvas unavailable

  ctx.drawImage(bitmap, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", quality)
  );

  if (!blob) return file;

  // Preserve original filename but the new mime/extension
  const newName = file.name.replace(/\.\w+$/, "") + ".jpg";
  return new File([blob], newName, { type: "image/jpeg" });
}