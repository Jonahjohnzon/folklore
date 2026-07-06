import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-2 text-ink-muted">
      <Loader2 size={20} className="animate-spin" />
      <span className="font-sans text-sm">Loading book…</span>
    </main>
  );
}