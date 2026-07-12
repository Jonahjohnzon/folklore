// lib/sound-effects.ts
import { SoundService } from "@/app/services/SoundService";
import type { PlatformSound } from "./sounds";

/**
 * The sound library now lives in the DB (managed from /admin/sounds), not
 * as a static array here. These helpers fetch it once and cache the result
 * in memory for the life of the page — a chapter's audioId is the Sound
 * document's _id, and the API response already includes its url alongside
 * it, so resolving id -> url/label is just a lookup once the list is loaded.
 */

let cache: PlatformSound[] | null = null;
let inFlight: Promise<PlatformSound[]> | null = null;

async function getSounds(): Promise<PlatformSound[]> {
  if (cache) return cache;
  if (!inFlight) {
    inFlight = SoundService.list()
      .then(({ data }) => {
        cache = data.sounds;
        return cache;
      })
      .catch(() => {
        // Don't cache failures — next call gets to retry.
        inFlight = null;
        return [];
      });
  }
  return inFlight;
}

/** Clears the cache — call after an admin edits/adds/removes a sound if the
 *  same session needs to see the change without a full reload. */
export function invalidateSoundCache() {
  cache = null;
  inFlight = null;
}

export async function soundUrlForId(id: string | null): Promise<string | null> {
  if (!id) return null;
  const sounds = await getSounds();
  return sounds.find((s) => s.id === id)?.url ?? null;
}

export async function soundIdForUrl(url: string | null | undefined): Promise<string | null> {
  if (!url) return null;
  const sounds = await getSounds();
  return sounds.find((s) => s.url === url)?.id ?? null;
}

export async function soundLabelForId(id: string | null): Promise<string | null> {
  if (!id) return null;
  const sounds = await getSounds();
  return sounds.find((s) => s.id === id)?.label ?? null;
}