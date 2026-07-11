import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface SignedUploadParams {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
}

/**
 * Produces the params a browser needs to upload directly to Cloudinary
 * without ever touching the API secret. Cloudinary re-derives the same
 * signature server-side from (folder + timestamp + secret) and rejects
 * the upload if it doesn't match — a real signed upload, not an
 * unsigned upload_preset that anyone with devtools open could reuse.
 */
export function signUpload(folder: string): SignedUploadParams {
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  if (!apiKey || !apiSecret || !cloudName) {
    throw new Error("Cloudinary isn't configured");
  }

  const timestamp = Math.round(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request({ folder, timestamp }, apiSecret);

  return { cloudName, apiKey, timestamp, signature, folder };
}

export default cloudinary;