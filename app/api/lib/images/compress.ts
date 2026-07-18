// app/api/lib/images/compress.ts
import sharp from "sharp";

const MAX_DIMENSION = 600; // covers rarely need to be bigger than this
const WEBP_QUALITY = 85;

export async function compressCoverImage(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .rotate() // respect EXIF orientation before stripping metadata
    .resize({
      width: MAX_DIMENSION,
      height: MAX_DIMENSION,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();
}