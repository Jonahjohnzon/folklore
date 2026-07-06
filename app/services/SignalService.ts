// app/services/SignalService.ts
import ApiClient from "@/app/ApiCore";
import type { SignalType } from "@/lib/types";

const api = new ApiClient();

export const SignalService = {
  // fire-and-forget by design — a failed analytics ping should never
  // block or error out the actual user action (reading, clicking a tag)
  log: (signal: SignalType, data: { bookId?: string; chapterId?: string; tagId?: string; payload?: Record<string, unknown> }) => {
    api.post("/api/signals", { signal, ...data }).catch(() => {});
  },
};