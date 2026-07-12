// app/services/SoundService.ts
import ApiClient from "@/app/ApiCore";
import type { PlatformSound } from "@/lib/sounds";

const api = new ApiClient();

interface Envelope<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const SoundService = {
  list: () => api.get<Envelope<{ sounds: PlatformSound[] }>>("/api/sounds"),
};