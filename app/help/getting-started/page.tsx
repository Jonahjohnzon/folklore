// app/help/getting-started/page.tsx
import Link from "next/link";
import { ArrowLeft, BookOpen, PenLine, UploadCloud, Rocket } from "lucide-react";

const STEPS = [
  {
    icon: BookOpen,
    title: "Create your book",
    body: "Start with a title, cover, and a short description. You can always change these later — nothing here is locked in.",
  },
  {
    icon: PenLine,
    title: "Write your first chapter",
    body: "Use the chapter editor to write directly, or import an existing draft from a PDF or .txt file. Add a title and some content, then save it as a draft.",
  },
  {
    icon: UploadCloud,
    title: "Set access and style",
    body: "Choose whether the chapter is free or costs coins, pick a sheet theme, and optionally add a background sound. These live in the sidebar while you edit.",
  },
  {
    icon: Rocket,
    title: "Publish",
    body: "When you're happy with the chapter, hit Publish. It becomes visible to readers immediately — you can keep adding chapters the same way.",
  },
];

export default function GettingStartedPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 font-sans text-sm font-medium text-ink-muted hover:text-accent"
      >
        <ArrowLeft size={15} /> Back
      </Link>

      <h1 className="mt-4 font-display text-3xl font-bold text-ink">Getting started guide</h1>
      <p className="mt-2 font-sans text-sm text-ink-muted">
        A quick walkthrough for publishing your first chapter, from a blank book to a live chapter readers can open.
      </p>

      <div className="mt-8 flex flex-col gap-4">
        {STEPS.map((step, i) => (
          <div
            key={step.title}
            className="flex gap-4 rounded-xl border border-hairline bg-surface p-5 shadow-sm"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
              <step.icon size={16} />
            </div>
            <div>
              <p className="font-sans text-xs font-semibold uppercase tracking-wide text-accent">
                Step {i + 1}
              </p>
              <h2 className="mt-0.5 font-display text-lg font-semibold text-ink">{step.title}</h2>
              <p className="mt-1 font-sans text-sm leading-relaxed text-ink-muted">{step.body}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-xl border border-hairline bg-bg p-5">
        <h2 className="font-display text-base font-semibold text-ink">Where to next</h2>
        <p className="mt-1.5 font-sans text-sm text-ink-muted">
          Once your first chapter is live, take a look at{" "}
          <Link href="/help/formatting-chapters" className="text-accent hover:underline">
            Formatting your chapters
          </Link>{" "}
          and{" "}
          <Link href="/help/growing-readership" className="text-accent hover:underline">
            Growing your readership
          </Link>
          .
        </p>
      </div>
    </main>
  );
}