// app/help/growing-readership/page.tsx
import Link from "next/link";
import { ArrowLeft, CalendarClock, MessagesSquare, Tags, Share2 } from "lucide-react";

const TIPS = [
  {
    icon: CalendarClock,
    title: "Publish on a consistent schedule",
    body: "Readers come back for chapters they can predict. Even a slower, steady pace (say, once a week) tends to build a more loyal readership than sporadic bursts.",
  },
  {
    icon: Tags,
    title: "Use accurate genre tags",
    body: "Tags are how readers discover your book through browse and search. Pick the genres that actually describe your story rather than the most popular ones — mismatched tags cost you retention even if they win you a click.",
  },
  {
    icon: MessagesSquare,
    title: "Reply to comments",
    body: "Paragraph-level comments are a direct line to your readers. Responding, even briefly, turns casual readers into people who feel invested in the book's progress.",
  },
  {
    icon: Share2,
    title: "Make your first chapters count",
    body: "Most readers decide whether to continue within the first chapter or two. Front-load the hook, keep early chapters free, and make sure the opening reads cleanly on both mobile and desktop.",
  },
];

export default function GrowingReadershipPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 font-sans text-sm font-medium text-ink-muted hover:text-accent"
      >
        <ArrowLeft size={15} /> Back
      </Link>

      <h1 className="mt-4 font-display text-3xl font-bold text-ink">Growing your readership</h1>
      <p className="mt-2 font-sans text-sm text-ink-muted">
        Practical habits that help new readers find your book — and keep coming back once they do.
      </p>

      <div className="mt-8 flex flex-col gap-4">
        {TIPS.map((tip) => (
          <div
            key={tip.title}
            className="flex gap-4 rounded-xl border border-hairline bg-surface p-5 shadow-sm"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
              <tip.icon size={16} />
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold text-ink">{tip.title}</h2>
              <p className="mt-1 font-sans text-sm leading-relaxed text-ink-muted">{tip.body}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-xl border border-hairline bg-bg p-5">
        <h2 className="font-display text-base font-semibold text-ink">Where to next</h2>
        <p className="mt-1.5 font-sans text-sm text-ink-muted">
          New to the platform? Start with the{" "}
          <Link href="/help/getting-started" className="text-accent hover:underline">
            Getting started guide
          </Link>{" "}
          before working on growth.
        </p>
      </div>
    </main>
  );
}